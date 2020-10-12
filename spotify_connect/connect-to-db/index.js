// Instagram OAuth 2 setup
const credentials = {
 client: {
   id: NOT_FOR_GIT, // Change this!
   secret: NOT_FOR_GIT, // Change this!
 },
 auth: {
   tokenHost: 'https://api.spotify.com',
   tokenPath: '/oauth/access_token'
 }
};
const oauth2 = require('simple-oauth2').create(credentials);