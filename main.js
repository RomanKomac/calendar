const express = require('express');
const path = require('path');
var app = express();
app.use(express.static(__dirname + '/html'));
app.use('/svg',express.static(__dirname + '/svg'));
app.use('/script',express.static(__dirname + '/script'));
app.use('/css',express.static(__dirname + '/css'));
app.use('/img',express.static(__dirname + '/img'));

app.get('/calendar', function (req, res) {
    res.sendFile(__dirname + "/html/calendar.html");
});
app.get('/admin', function (req, res) {
    res.sendFile(__dirname + "/html/admin.html");
});

app.post('/login', function (req, res) {
    res.send(__dirname + "/html/admin.html");
});

app.post('/register', function (req, res) {
    res.send(__dirname + "/html/admin.html");
});

app.listen(8081, function () {
  console.log('Aplikacija tece na 8081!')
})