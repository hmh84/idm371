var request = require('request');
var express = require('express');
var path = require('path');
var ejs = require('ejs');

var app = express();
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded());

function callback(error, response, body) {
	 if (error) {
		 console.log('?? error');
	 }
    else if (response.statusCode != 200) {
        console.log('?? statuscode');
		  console.log(response.statusCode);
    }
	 else {
		 obj = JSON.parse(body);
		 songname = obj.tracks.items[0].name;
		 songid = obj.tracks.items[0].id;
		 console.log(songname, songid);
		 return songname;
	 }
}

//request(options, callback);

function search(criteria, callback) {
	var query = criteria;
	var headers = {
		 'Accept': 'application/json',
		 'Content-Type': 'application/json',
		 'Authorization': 'Bearer not for u'
	};
	var options = {
    url: 'https://api.spotify.com/v1/search?q='+query+'&type=track&limit=1',
    headers: headers
	};
	request(options, callback);
}

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post("/search", function(req, res) { //for future send the token stored in the browser as part of the request
	var criteria = req.body.searchinput;
	search(criteria, (error, response, body) => {
		 if (error) {
			 console.log('?? error');
			 return;
		 }
		 else if (response.statusCode != 200) {
			  console.log('?? statuscode');
			  console.log(response.statusCode);
			  return;
		 }
		 else {
			 obj = JSON.parse(body);
			 songname = obj.tracks.items[0].name;
			 songid = obj.tracks.items[0].id;
			 console.log(songname, songid);
			 res.render(__dirname + "/search-results.html", {name:songname, id:songid});
		 }
	});
});

app.listen('8000');