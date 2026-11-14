/**
 * Check the email (SMTP) setup used for contact-form replies.
 *
 *   npm run mail:check                    -> logs in to the mail server, sends nothing
 *   npm run mail:check -- you@example.com -> also sends one test email to that address
 */
import dotenv from "dotenv";
dotenv.config();
import { sendContactReply, verifyMail } from "../services/mailService";

async function main() {
  const login = await verifyMail();
  console.log(login.ok ? `OK  ${login.message}` : `FAILED  ${login.message}`);
  if (!login.ok) process.exit(1);

  const to = process.argv[2];
  if (!to) {
    console.log("Login works. To send a real test email: npm run mail:check -- you@example.com");
    return;
  }
  await sendContactReply(to, "Email test", "This is a test of the Damarika contact-reply email. If you can read this, replies to the contact form will reach visitors.");
  console.log(`OK  Test email sent to ${to}. Check that inbox (and its spam folder).`);
}

main().catch((error) => {
  console.error(`FAILED  ${error.message}`);
  process.exit(1);
});
