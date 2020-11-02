var request = require('request');
var express = require('express');
var path = require('path');
var ejs = require('ejs');

var app = express();
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded());

function search(criteria, callback) {
	var query = criteria;
	var headers = {
		 'Accept': 'application/json',
		 'Content-Type': 'application/json',
		 'Authorization': 'Bearer BQA9gKuUPdxAvG_FxBKzkZREUii8J0Brt5VgZ5M4n7JmEbLd2wzwFRtD2Kg40p0J3FU2bqr88onSvCWvqHWkAfdZ05OQR2CPeHDuoYd64bumqYj5CNMCgew67u-uGtLEndEvoh2ltTtR8uzJg7cZ'
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