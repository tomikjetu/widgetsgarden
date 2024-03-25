import { getUserFromApiKey } from "../../accounts.js";
import { ORIGINS, accessGranted, canAccess } from "../../router/widgets.js";
import cors from "cors";
import { Analysis } from "./Analysis/Analyze.js";

if (process.env.ENVIRONMENT == "production") setInterval(Analysis, 60 * 60 * 1000);

export default function analytics(app) {
  app.post(
    "/analytics",
    cors({
      origin: function (origin, callback) {
        callback(null, true);
      },
    }),
    async (req, res) => {
      var iframe = canAccess(req);
      var page = await accessGranted(req);

      if (!iframe && !page) return res.sendStatus(403);

      var origin;

      if (iframe) origin = ORIGINS[req.body.secret];
      else
        origin = {
          referrer: req.query.referrer,
          path: req.query.path,
        };

      const User = await getUserFromApiKey(req.body.apiKey);
      if (!User) return res.sendStatus(200);
      AnalyticRecieved(User.uuid, req.body.widgetId, req, req.body.analytic, req.body.value, origin);
      res.sendStatus(200);
    }
  );
}
