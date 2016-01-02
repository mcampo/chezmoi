var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var moment = require('moment');
moment.locale('es');

var hbs = require('hbs');
hbs.registerHelper('fromNow', function (date){
    return moment.utc(date).fromNow();
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_SECRET,
        callbackURL: "http://www.chezmoi.io/auth/google/callback"
    },
    function(token, tokenSecret, profile, done) {
        var user = {
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value
        };
        return done(null, user);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user)
});

var authorizedUsers = process.env.AUTHORIZED_USERS.split(',');
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (authorizedUsers.indexOf(req.user.email) >= 0) {
            return next();
        }
        res.render('unauthorized');
    } else {
        res.redirect('/login');
    }
}

var routes = require('./routes/index');
var webConsole = require('./routes/console');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'secret' }))
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/console', checkAuthenticated, webConsole);

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
