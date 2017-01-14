const express = require('express');
const path    = require('path');
const crypto  = require('crypto');
const bodyParser = require('body-parser')
const models  = require('./models');
const winston = require('winston');
var app = express();
app.use(bodyParser.json())
app.use(express.static(__dirname + '/html'));
app.use('/svg',express.static(__dirname + '/svg'));
app.use('/script',express.static(__dirname + '/script'));
app.use('/css',express.static(__dirname + '/css'));
app.use('/img',express.static(__dirname + '/img'));

var admins = {};
var tokens = {};

app.get('/calendar', function (req, res) {
	rc = req.headers.cookie;
	if(rc){
		cookies = {};
		rc.split(';').forEach(function(str){
			var c = str.split('=');
			cookies[c[0].trim()] = c[1].trim();
		});
		if(cookies["token"] && cookies["user"] && tokens[cookies["user"]] === cookies["token"]){
			res.sendFile(__dirname + "/html/calendar.html");
			return;
		}
	}
	//unauthorized access, logging to console and file
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	res.redirect('/');
});
app.get('/admin', function (req, res) {
    res.sendFile(__dirname + "/html/admin.html");
});

app.post('/login', function (req, res) {
    res.json({sd:"awd"});
});

app.post('/register', function (req, res) {
    var peq = req.body.password1 === req.body.password2;
	var unm = req.body.username.length > 1;
	var mai = req.body.mail.match(/.+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/);
	console.log(req.body);
	if(mai && unm && peq){
		crypto.randomBytes(20, function(err, buf){
			if(err) throw err;
			tokens[req.body.username] = buf.toString("hex");
			res.json({
				status: "ok",
				cookie: buf.toString("hex"),
				user: req.body.username,
				referal: "calendar"
			});
		});
	} else {
		res.json({
			status: "nok",
			message: "Data fields invalid"
		});
	}
});

app.listen(8081, function () {
  console.log('Aplikacija tece na 8081!')
})