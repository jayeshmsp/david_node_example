var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');
var bcrypt      = require('bcrypt-nodejs');
var session = require('express-session');
var User = require('../app/models/user');
// var app = express();


module.exports = function(passport) {


	passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.where('id',profile.id).fetch().then(function(err,user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user.toJSON()); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    // set all of the facebook information in our user model
                    var newUser = new Object();
                    newUser.id    = profile.id;
                    newUser.fb_token_id = token;
                    newUser.email = profile.emails[0].value;// facebook can return multiple emails so we'll take the first
                    newUser.username  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.first_name  = profile.name.givenName;
                    // save our user to the database
                    new User(newUser).save().then(function(model) {
                          return done(null, model);
                        });
                }

            });
        });

    }));





    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log(user.id);
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        
        User.where('id', id).fetch().then(function(user) {
          done(null, user.toJSON()); 
          console.log(user.id);
        }).catch(function(err) {
          console.error(err);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

                User.where('email',email).fetch().then(function(user) {
                   
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        var newUserMysql = new Object();
                             newUserMysql.email    = email;
                             newUserMysql.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                        new User(newUserMysql).save().then(function(model) {
                          return done(null, model);
                        });
                    }

                }).catch(function(err) {
                  console.error(err);
                });
              
        });

    }));

   	passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

         User.where('email',email).fetch().then(function(user) {

                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'No user found'));
                }
                console.log(user.toJSON().password);
               var pass = bcrypt.compareSync(password, user.toJSON().password);
                if(!pass){
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }
                return done(null, user.toJSON());
            }).catch(function(err) {
              console.error(err);
            });

    }));
};