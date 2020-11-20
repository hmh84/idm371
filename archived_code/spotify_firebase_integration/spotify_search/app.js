var request = require('request');
var express = require('express');
var path = require('path');
// var ejs = require('ejs');

var app = express();
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded());

function search(criteria, callback) {
    var query = criteria;
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_goes_here'
    };
    var options = {
        url: 'https://api.spotify.com/v1/search?q=' + query + '&type=track&limit=10',
        headers: headers
    };
    request(options, callback);
}

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post("/search", function (req, res) { //for future send the token stored in the browser as part of the request
    var criteria = req.body.searchinput;
    search(criteria, (error, response, body) => {
        if (error) {
            console.log('?? error');
            return;
        } else if (response.statusCode != 200) {
            console.log('?? statuscode');
            console.log(response.statusCode);
            return;
        } else {
            obj = JSON.parse(body);
            items = obj.tracks.items; // Makes the obj items an array

            let tracks = [];
            let i = -1;
            items.forEach(item => { // Loop thru each result and push the info we want into the tracks array
                i++;
                tracks.push(i, {
                    'id': item.id,
                    'title': item.name,
                    'artist': item.artists[0].name,
                    'thumb': item.album.images[2].url,
                });
                // console.log(tracks[i]); // Logs each track object result
            });
            res.render(__dirname + "/search-results.html", { tracks: tracks });
        }
    });
});

app.listen('8000');
console.log('Started server on localhost:8000');