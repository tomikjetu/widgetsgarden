import { Strategy as passportLocal } from "passport-local";
import passportGoogle from 'passport-google-oauth20';
import {sha512} from 'js-sha512';

export function hashPassword(password) {
  return sha512(password);
}

function comparePassword(hash, password) {
  return hash == sha512(password);
}

import { User } from "./database.js";
import { createGoogleAccount } from "./accounts.js";

export default function (passport) {
  passport.use(
    new passportLocal({
      usernameField: "email",
      passwordField: "password",
    }, (email, password, done) => {
      User.findOne({ email }).then((user) => {
        if (!user) return done("Account doesn't exist.", false);
        if (user.authenticationMethod != "local") return done("This account uses another sign-in method.", false);
        var authenticated = comparePassword(user.password, password);
        if (authenticated) return done(null, user)
        else return done("Wrong password.", false);
      });
    }));

  passport.use(new passportGoogle({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/redirect`,
    passReqToCallback: true
  },
    // Login Callback
    async (req, accessToken, refreshToken, profile, done) => {
      const GoogleUser = profile._json;

      var email = GoogleUser.email;
      var username = GoogleUser.name;

      var DatabaseEntry, otherStrategy = false;

      await User.findOne({ email }).then(async (user) => { if (user) { DatabaseEntry = user; if (user.authenticationMethod != "google") otherStrategy = true } });

      if (otherStrategy) return done(null, false, "This email uses another method to sign in.");
      if (DatabaseEntry) {
        console.log(`Google login for ${username}`);
        return done(null, DatabaseEntry);
      }

      var DatabaseEntry = await createGoogleAccount(req, email, username);
      return done(null, DatabaseEntry);
    }));


  passport.serializeUser((user, cb) => {
    cb(null, {
      uuid: user.uuid,
      username: user.username
    });
  })

  passport.deserializeUser((uuid, cb) => {
    var user = User.findOne({ uuid });
    cb(null, user);
  })
}