var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon')

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public/open-iconic/png/cloudy-4x.png')));

app.get('/', function (req, res) {
    res.render('pages/index');
});

app.listen(80, function () {
  console.log('Running');
});
