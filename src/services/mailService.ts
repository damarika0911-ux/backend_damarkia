import nodemailer from "nodemailer";

export async function sendContactReply(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw Object.assign(new Error("Configure SMTP before sending replies"), { statusCode: 503 });
  }
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port, secure: port === 465,
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10000, socketTimeout: 15000,
  });
  const result = await transport.sendMail({ from: process.env.SMTP_EMAIL, to, subject: `Re: ${subject || "Your Damarika enquiry"}`, text });
  if (!result.accepted.length) throw new Error("Email was not accepted by the mail server");
}
