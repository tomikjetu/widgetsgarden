// ░█████╗░██╗░░░██╗████████╗██╗░░██╗███████╗███╗░░██╗████████╗██╗░█████╗░░█████╗░████████╗██╗░█████╗░███╗░░██╗
// ██╔══██╗██║░░░██║╚══██╔══╝██║░░██║██╔════╝████╗░██║╚══██╔══╝██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║
// ███████║██║░░░██║░░░██║░░░███████║█████╗░░██╔██╗██║░░░██║░░░██║██║░░╚═╝███████║░░░██║░░░██║██║░░██║██╔██╗██║
// ██╔══██║██║░░░██║░░░██║░░░██╔══██║██╔══╝░░██║╚████║░░░██║░░░██║██║░░██╗██╔══██║░░░██║░░░██║██║░░██║██║╚████║
// ██║░░██║╚██████╔╝░░░██║░░░██║░░██║███████╗██║░╚███║░░░██║░░░██║╚█████╔╝██║░░██║░░░██║░░░██║╚█████╔╝██║░╚███║
// ╚═╝░░╚═╝░╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝

/* responses: (code)
  error:"Message"
  success:"Message"
*/

import { createLocalAccount, localLogIn, getUserSerialization, getUser, isLogged, getProfilePicture, getUserGuide, skipIntroduction } from "../accounts.js";
import { hashPassword } from "../passport.js";
import * as fs from 'fs'

export default function (app, passport) {
  app.post("/api/auth/local/register", async function (req, res) {
    var user = await createLocalAccount(req, res);
    if (!res.headersSent) localLogIn(req, res, user, "success:Account Created");
  });

  app.post("/api/auth/local/login", (req, res, next) => {
    passport.authenticate("local", {}, (err, user, info) => {
      if (err) return res.send(`error:${err}`);
      if (!user) return res.send("error:An Error Occured.");
      localLogIn(req, res, user, "success:Logged in");
    })(req, res, next);
  });

  app.post("/api/auth/local/changePassword", isLogged, async (req, res) => {
    var user = await getUser(req);

    if(user.authenticationMethod != "local") return res.json({message: "Forbidden."});
    
    var { currentPassword, newPassword } = req.body;
    currentPassword = hashPassword(currentPassword);
    if(user.password != currentPassword) return res.json({message: "Invalid password"})

    user.password = hashPassword(newPassword);
    await user.save();

    res.json({message: "Password Changed", clear: true});
  });

  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      successRedirect: `${process.env.BASE_URL}`, // Redirect to success URL after authentication
      failureMessage: true, // Enable failure message
      scope: ["email", "profile"],
    })
  );

  app.get("/api/auth/google/redirect", passport.authenticate("google", { failureRedirect: "/api/auth/google/fail", failureFlash: true }), function (req, res) {
    res.redirect(`${process.env.WEBSITE_URL}/dashboard`);
  });

  app.get("/api/auth/google/fail", (req, res) => {
    var error = req.flash("error");
    res.redirect(`${process.env.WEBSITE_URL}/login?error=${encodeURIComponent(error)}`);
  });

  app.get("/api/profile", async (req, res) => {
    const User = await getUser(req);
    if(!User) return res.json({});
    res.json({
      username: User.username,
      uuid: User.uuid,
      authenticationMethod: User.authenticationMethod,
      email: User.email,
      admin: User.admin ?? false,
      picture: getProfilePicture(User),
      guide: await getUserGuide(User)
    });
  });

  app.post("/api/skipIntro", async (req, res) => {
    const User = await getUser(req);
    skipIntroduction(User);
    res.send(true);
  });

  app.get("/api/assets/profile/:ID", async (req,res)=>{
      var User = await getUser(req);
      getProfilePicture(User);
      var url = `./server/assets/profiles/${User.uuid}.jpg`;

      fs.readFile(url, (err, data) => {
        if (err) {
          console.log(err);
          return res.send("error:An error occured");
        }
        res.send(data);
      });

  });

  app.get("/api/auth/logout", (req, res) => {
    const User = getUserSerialization(req);
    if (User) {
      req.logOut((err) => {
        if (err) return res.send("error:An error occured");
        console.log(`${User.username} logged out!`);
      });
    }
    res.send("success:Logged out");
  });
}
