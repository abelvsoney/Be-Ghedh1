var createError = require('http-errors');
var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
const Handlebars = require('handlebars')

var bodyparser = require('body-parser')
var session = require('express-session')




var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var db=require('./database/connection');


const app = express();

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname:'hbs', defaultLayout:'layout', layoutsDir:__dirname+'/views/layout/', partialsDir:__dirname+'/views/partials/'}))

app.use(bodyparser.json())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
// app.use(bodyparser())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "views")));

const nocache = require('nocache');
// const bodyParser = require('body-parser');
app.use(nocache());

db.connect(function(err) {
  if(err) console.log('error'+err);
  else console.log("database connected");
})


app.use('/admin', adminRouter);
app.use('/', usersRouter);

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