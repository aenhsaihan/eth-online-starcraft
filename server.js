// require('dotenv/config')
const express = require('express');
const app = express();

const request = require('request');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const passport = require('passport');

const BnetStrategy = require('passport-bnet').Strategy;

const BNET_ID = process.env.BNET_ID;
const BNET_SECRET = process.env.BNET_SECRET;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the BnetStrategy within Passport
passport.use(
    new BnetStrategy(
      { clientID: BNET_ID,
        clientSecret: BNET_SECRET,
        scope: "sc2.profile",
        callbackURL: "https://eth-online-starcraft.herokuapp.com/auth/bnet/callback" },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      })
  );

  // configure Express
app.use(cookieParser());
app.use(session({ secret: 'blizzard',
                  saveUninitialized: true,
                  resave: true }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/bnet',
        passport.authenticate('bnet'));

app.get('/auth/bnet/callback',
        passport.authenticate('bnet', { failureRedirect: '/' }),
        function(req, res){
          res.redirect('/');
        });

app.get('/', function(req, res) {
  if(req.isAuthenticated()) {
    var output = '<h1>Express OAuth Test</h1>' + req.user.id + '<br>';
    if(req.user.battletag) {
      output += req.user.battletag + '<br>';
      output += req.user.provider + '<br>';
      output += req.user.token + '<br>';
    }
    output += '<a href="/matches">Matches</a>' + '<br>';
    output += '<a href="/logout">Logout</a>';
    res.send(output);
  } else {
    res.send('<h1>Express OAuth Test</h1>' +
             '<a href="/auth/bnet">Login with Bnet</a>');
  }
});

app.get('/matches', function(req, res) {
    if(req.isAuthenticated()) {
        request('https://us.api.blizzard.com/sc2/legacy/profile/1/1/1024475/matches?access_token=USxkDM2RvhFks6p7Ff2G3IkfgI5Jy46L2i', { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }

            let output = "<table border='1|1'>";
            for (let index = 0; index < body.matches.length; index++) {
                html+="<tr>";

                html+="<td>"+body.matches[i].map+"</td>";
                html+="<td>"+body.matches[i].type+"</td>";
                html+="<td>"+body.matches[i].decision+"</td>";
                html+="<td>"+body.matches[i].speed+"</td>";
                html+="<td>"+body.matches[i].date+"</td>";
                
                html+="</tr>";
            }
        });

        res.send(output);
    }
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

const server = app.listen(process.env.PORT || 5000, function() {
    console.log('Listening on port %d', server.address().port);
  });
