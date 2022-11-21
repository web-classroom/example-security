var path = require('path');
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

// Passport 
passport.use(new Strategy(function (username, password, done) {
  return done(null, { username: username  });
}));

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  done(null, { username: username });
});

// Application
var app = express();

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false, cookie: {httpOnly: false} }));
app.use(passport.initialize());
app.use(passport.session());

// State
var html = '<i>Editable HTML</i>'

// Routes
app.get('/', function (req, res) {
  res.render('index', { user: req.user, html: html });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function (req, res) {
  res.redirect('/');
});

app.get('/logout', function (req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/edit', loggedIn, function (req, res) {
  res.render('edit', { html: html });
});

app.post('/edit', loggedIn, function (req, res) {
  html = req.body.html;
  res.redirect('/');
});

app.get('/secret', function(req, res) {
  if (req.user) {
    res.send("J'écoute Tailor Swift en secret!");
  } else {
    res.send("Unauthorized")
  }
});

app.listen(3000, () => console.log(`Vulnerable app listening on port 3000!`))