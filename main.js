const express = require('express');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');
const bodyParser = require('body-parser')
const models  = require('./models');
const winston = require('winston');
const logdir  = 'logs';

// Setting up app
var app = express();
app.use(bodyParser.json())
app.use(express.static(__dirname + '/html'));
app.use('/svg',express.static(__dirname + '/svg'));
app.use('/script',express.static(__dirname + '/script'));
app.use('/css',express.static(__dirname + '/css'));
app.use('/img',express.static(__dirname + '/img'));

// Session cookies
var admins = {};
var tokens = {};

// Time formatter for Winston Logger
var tform = function(){return (new Date()).toLocaleTimeString()};

// Logger initialization
var logger = new (winston.Logger)({
  transports: [
    // Console output
    new (winston.transports.Console)({
      timestamp: tform,
      colorize: true,
      level: 'debug'
    }),
	// File output
    new (require('winston-daily-rotate-file'))({
      filename: `${logdir}/.log`,
      timestamp: tform,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: 'info'
    })
  ]
});

// Create directory for log files
if (!fs.existsSync(logdir)) {
  fs.mkdirSync(logdir);
}

//For debugging purposes
app.get('/debug', function(req, res) {
	crypto.randomBytes(20,function(err, buf){
	var pass = "user" + buf.toString('hex');
	var shasum = crypto.createHash('sha1');
	shasum.update(pass);
	models.user.build({ gid: 1, username: 'user', password: shasum.digest('hex'), salt: buf.toString('hex'), mail: 'user@user.com', gender: 'male' }).save()
	.then(function(anotherTask) {
	// you can now access the currently saved task with the variable anotherTask... nice!
	}).catch(function(error) {
		console.log(error);
	// Ooops, do some error-handling
	})
	});
	res.send("asd");
	res.end();
});


// GET request of calendar webpage
app.get('/calendar', function (req, res) {
	rc = req.headers.cookie;
	if(rc){
		cookies = {};
		rc.split(';').forEach(function(str){
			var c = str.split('=');
			cookies[c[0].trim()] = c[1].trim();
		});
		if(cookies["token"] && cookies["user"] && 
		(tokens[cookies["user"]] === cookies["token"] || admins[cookies["user"]] === cookies["token"])){
			//successfully logged in, loading calendar page
			res.sendFile(__dirname + "/html/calendar.html");
			logger.info("User [" + cookies["user"] + "] accessed the calendar page");
			return;
		}
	}
	// Unauthorized access, logging to console and file
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	logger.warn("[" + ip + "] tried to acces the calendar page with User:[" + cookies["user"] + "] and Token:[" + cookies["token"] + "]");
	res.redirect('/');
});

// GET request of admin webpage
app.get('/admin', function (req, res) {
    rc = req.headers.cookie;
	cookies = {};
	if(rc){
		rc.split(';').forEach(function(str){
			var c = str.split('=');
			cookies[c[0].trim()] = c[1].trim();
		});
		if(cookies["token"] && cookies["user"] && admins[cookies["user"]] === cookies["token"]){
			//successfully logged in, loading admin page
			res.sendFile(__dirname + "/html/admin.html");
			logger.info("User [" + cookies["user"] + "] accessed the admin page");
			return;
		}
	}
	// Unauthorized access, logging to console and file
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	logger.warn("[" + ip + "] tried to acces the admin page with User:[" + cookies["user"] + "] and Token:[" + cookies["token"] + "]");
	res.redirect('/');
});

app.post('/login', function (req, res) {
    if(req.body.username && req.body.password){
		models.user.findOne({ where: {username: req.body.username}}).then(function(userdata){
			if(userdata){
				var vals = userdata.dataValues;
				var pass = req.body.password + vals.salt;
				var shasum = crypto.createHash('sha1');
				shasum.update(pass);
				if(shasum.digest('hex') === vals.password){
					crypto.randomBytes(20, function(err, buf){
						if(err) throw err;
						if(vals.gid == 1){
							tokens[req.body.username] = buf.toString("hex");
							res.json({
								status: "ok",
								cookie: buf.toString("hex"),
								user: req.body.username,
								referal: "calendar"
							});
						}
						else if(vals.gid == 0){
							admins[req.body.username] = buf.toString("hex");
							res.json({
								status: "ok",
								cookie: buf.toString("hex"),
								user: req.body.username,
								referal: "admin"
							});
						}
					});
					return;
				}
			}
			// Unsuccessful login attempt, logging to console and file
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			logger.warn("[" + ip + "] tried to login as User:[" + req.body.username + "]");
			res.json({
				status: "nok",
				message: "Username or password incorrect"
			});
			return;
		});
	} else {
		res.json({
			status: "nok",
			message: "Data fields incomplete"
		});
	}
});

// POST request for Registration
app.post('/register', function (req, res) {
    var peq = req.body.password1 === req.body.password2;
	var unm = req.body.username.length > 1;
	var mai = req.body.mail.match(/.+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/);
	if(mai && unm && peq){
		crypto.randomBytes(20, function(err, buf){
			if(err) throw err;
			tokens[req.body.username] = buf.toString("hex");
			
			// Add to database
			crypto.randomBytes(20,function(err, buf){
				var pass = req.body.password1 + buf.toString('hex');
				var shasum = crypto.createHash('sha1');
				shasum.update(pass);
				models.user.build({ gid: 1, username: req.body.username, password: shasum.digest('hex'), salt: buf.toString('hex'), mail: req.body.mail, gender: req.body.gender }).save()
				.then(function(anotherTask) {
					res.json({
						status: "ok",
						cookie: buf.toString("hex"),
						user: req.body.username,
						referal: "calendar"
					});
					// Write to console/log
					logger.info('User ['+ req.body.username+'] registered');
				}).catch(function(error) {
					res.json({
						status: "nok",
						message: error
					});
				})
			});
		});
	} else {
		res.json({
			status: "nok",
			message: "Data fields invalid or incomplete"
		});
	}
});

app.listen(8082, function () {
  logger.debug('App on port 8082')
})