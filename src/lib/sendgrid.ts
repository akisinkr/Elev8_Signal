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
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "andrewkim.elev8@gmail.com";

  return sgMail.send({
    to,
    from: { email: fromEmail, name: "Elev8 Signal" },
    subject,
    html,
  });
}

export { sgMail };
