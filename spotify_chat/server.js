/**
 RESOURCES:
 Spotify:
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 Firebase with node.js:
 * https://medium.com/feedflood/write-to-cloud-firestore-using-node-js-server-c84859fefb86
 */

//STEP 1: ADD DEPENDENCIES / AUTHENTICATION FOR SPOTIFY
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

const config = require('../secret/config');

var client_id = config.client_id;
var client_secret = config.client_secret; // Your secret
var redirect_uri = config.redirect_uri; // Your redirect uri

//STEP 2: CONNECT TO FIREBASE FIRESTORE DB WITH SERVICE ACCT KEY
const admin = require('firebase-admin');
const serviceAccount = require('../secret/serviceAccountKey.json');
//initialize admin SDK using serciceAcountKey
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

//STEP 2.5: DECLARE SOME VARS, HELPER FUNCTIONS
/**
 this helper function provided by spotify tutorial
 used to authenticate when requesting login to the API
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

//statekey and state are used to redirect user
var stateKey = 'spotify_auth_state';

//get data to send to firestore db as json string
//this function sends it as a promise
function getDialogue(thebody) {
    //return a promise since we'll imitating an API call
    return new Promise(function(resolve, reject) {
        resolve({
            "country": thebody.country,
            "email": thebody.email
        });
    })
}

//STEP 3: START EXPRESS FRAMEWORK
//this gives you functions that let you say node app.js
//and it runs a server
//instead of having to make the whole http request manually
var app = express();
app.use(express.static(__dirname + '/'))
    .use(cors())
    .use(cookieParser());
app.engine('html', require('ejs').renderFile);


//STEP 4: SEND REQUEST FOR INFO TO SPOTIFY
//@Spotify heres my creds, send user pls
//when the user hits a button with href=/login, this happens
app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

//STEP 5: GET INFO BACK FROM SPOTIFY
//double check its them though
app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    //first get spotify request's secret keys or set to null
    var code = req.query.code || null;
    var state = req.query.state || null;

    //check if we saved a state (our code for authentication)
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    //if state isnt right we don't take the response
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else { //if the state checks out, we go ahead and get the response
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        //handle the response
        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                //here is where we get the response
                //body is what we want to send
                // use the access token to access the Spotify Web API
                //STEP 6: SEND INFO FROM RESPONSE BACK TO FIRESTORE DB
                request.get(options, function(error, response, body) {
                    // console.log(body);
                    getDialogue(body).then(result => {
                        const obj = result;
                        const user_id = body.id; // Set current user id

                        // Now check if user exists already...
                        const docRef = db.collection('users').doc(user_id);
                        docRef.get().then(function(doc) {
                            doc.exists ? user_status = false : user_status = true; // Get new user status
                            redirect_to_shuffle(res, docRef, obj, user_id, user_status); // Send data to redirect
                        }).catch(function(error) {
                            console.log(error);
                        });

                    });
                });

                // we can also pass the token to the browser to make requests from there
                // res.redirect('/#' +
                //   querystring.stringify({
                //     access_token: access_token,
                //     refresh_token: refresh_token
                //   }));

            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

//this is how the demo shows requesting a refresh token
app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

// ==============================
// REDIRECT TO SHUFFLE (chat.html)
// ==============================

function redirect_to_shuffle(res, docRef, obj, user_id, user_status) {
    const data = { // User fields to add
        country: obj.country,
        email: obj.email,
        new_user: user_status
    };

    if (user_status) { // New Users
        docRef.set(data).then(function() { // Using .SET() method
            console.log(`Added ${user_id} to DB!`);
        }).catch(function(error) {
            console.error(error);
        });
    } else { // Returning Users
        docRef.update(data).then(function() { // Using .UPDATE() method
            console.log(`Updated ${user_id} in DB!`);
        }).catch(function(error) {
            console.error(error);
        });
    }

    // Render client script data
    //	res.render(__dirname + "/chat.html", {
    //		dev_mode: 'node',
    //		s_id: user_id,
    //		new_user: user_status
    //	});

    res.redirect("/chat.html#" +
        querystring.stringify({
            dev_mode: 'node',
            s_id: user_id,
            new_user: user_status
        }));
}

// ==============================
// START NODE SERVER
// ==============================

console.log('Listening on 8888');
app.listen(8888);