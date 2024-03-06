import { render } from '@react-email/render';
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function sendEmail(email, subject, template, params) {
  resend.emails.send({
    from: "WidgetGarden <noreply@widgetsgarden.com>",
    to: email,
    subject: subject,
    html: render(template(params))
  });
}