import { render } from "@react-email/render";
import { Resend } from "resend";
import RegistrationEmail from "./modules/mailer/emails/src/Registration";

const resend = new Resend(process.env.RESEND_API_KEY);

export function sendEmail(email, subject, template, params) {
  resend.emails.send({
    from: "WidgetGarden <noreply@widgetsgarden.com>",
    to: email,
    subject: subject,
    html: render(
      template({
        ...params,
        baseUrl: process.env.REACT_APP_WEBSITE_URL,
      })
    ),
  });
}

export function welcomeEmail(email, name, confirmationLink) {
  sendEmail(email, `Welcome to WidgetsGarden ${name}!`, RegistrationEmail, { name, confirmationLink });
}
