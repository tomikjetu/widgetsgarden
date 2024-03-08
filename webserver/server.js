import 'dotenv/config'
import "./server/misc/console.js";

import express from 'express'
import session from 'express-session'
import { default as connectMongoDBSession } from 'connect-mongodb-session';
const MongoDBStore = connectMongoDBSession(session);

import { default as Router } from "./server/router.js"

const app = express();

app.use((req, res, next) => {
  var start = Date.now();
  res.on('finish', () => {
    var responseTime = Date.now() - start;
    var ip = req.headers['x-forwarded-for'] || req.ip;
    console.log(`${ip} ${req.headers['user-agent']} - ${req.method} ${req.url} HTTP/${req.httpVersion} ${res.statusCode} ${responseTime}ms`);
  })
  next();
});

//MongoDB database to save user sessions
const store = new MongoDBStore({
  uri: process.env.ACCOUNTS_DATABASE,
  collections: 'sessions'
});

Router(app, session, store);

const PORT = process.env.PORT;
app.listen(process.env.PORT, function (err) {
  console.log(`Server listening on port ${PORT}.`)
});