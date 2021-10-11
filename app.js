var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ocrsdk = require('./routes/ocrsdk');

var app = express();

app.use(logger('dev'));
app.use(express.json( {limit: "10mb"}));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.set('view engine', 'pug');


app.use('/', ocrsdk);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
