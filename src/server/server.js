var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./db/db.js');
var User = db.User;


var app = express();

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('../client/env/config.js');

app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/../client'));

passport.use(new FacebookStrategy({
  clientID: configAuth.facebookAuth.clientID,
  clientSecret: configAuth.facebookAuth.clientSecret,
  callbackURL: configAuth.facebookAuth.callbackURL
},
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'userName': profile.id}, function(err, user) {
      if (err) { return done(err); }
      //if no user was found, create a new user with values from Facebook
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.userName,
          provider: 'facebook',
          facebook: profile._json
        });
        user.save(function(err) {
          if (err) { console.log(err); }
          return done(err, user);
        });
      } else {
        //found user. Return
        return done(err, user);
      }
    });
  }
));

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

app.listen(3000, function() {
  console.log('Server listening.  Go Vizly');
});


