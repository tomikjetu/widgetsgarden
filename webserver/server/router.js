/*
  Router for WidgetGarden.js
  author: tomikjetu

  Big Text Generator  https://fsymbols.com/generators/tarty/

*/

import express from "express";
import Handlebars from "express-handlebars";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload"
import passport from "passport";
import cors from "cors";
import flash from "connect-flash";

import { default as PassportRouter } from "./passport.js";
import { default as DashboardRouter } from "./router/dashboard.js";
import { default as AuthenticationRouter } from "./router/authentication.js";
import { default as WidgetsRouter } from "./router/widgets.js";
import analytics from "./analytics.js";
import YoutubeWidgetEndpoint from "./widget-endpoints/youtube.js";
import AiWidgetEndpoint from "./widget-endpoints/assistant.js";

export default function (app, session, store) {
  const HandlebarsConfig = Handlebars.create({});

  HandlebarsConfig.handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  app.engine("handlebars", Handlebars.engine());
  app.set("trust proxy", true);
  app.set("view engine", "handlebars");
  app.set("views", ["server/api/widgets"]);

  app.use(express.static("public"));
  app.use(fileUpload());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({ secret: "i generated the cookies and no one else did", resave: true, saveUninitialized: true, store: store, cookie: { expires: new Date(253402300000000) } }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  var origins = [];
  if (process.env.ENVIRONMENT == "production") origins = ["https://widgetsgarden.com", "https://www.widgetsgarden.com"];
  if (process.env.ENVIRONMENT == "development") origins = ["http://localhost:3000", "http://localhost:4100"];

  app.use(
    "/api",
    cors({
      origin: function (origin, callback) {
        if (origins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
  app.use(
    "/analytics",
    cors({
      origin: function (origin, callback) {
        callback(null, true);
      },
      credentials: true,
    })
  );

  app.use((req, res, next) => {
    req.session.ip = req.ip;
    req.session.save();
    next();
  });
  PassportRouter(passport);
  DashboardRouter(app);
  AuthenticationRouter(app, passport);
  WidgetsRouter(app);
  analytics(app);

  // Widget Api Endpoints
  YoutubeWidgetEndpoint(app);
  AiWidgetEndpoint(app)



  app.get("*", function (req, res) {
    res.sendStatus(404);
  });
}
