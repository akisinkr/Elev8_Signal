import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });
}

export { sgMail };
