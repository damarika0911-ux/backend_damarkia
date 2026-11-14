import nodemailer from "nodemailer";
import logger from "../utils/logger";

/** A problem the admin can act on (bad SMTP settings, mail server down). Shown to them as-is. */
export class MailError extends Error {
  statusCode = 502;
  constructor(message: string) {
    super(message);
    this.name = "MailError";
  }
}

function transport() {
  const { SMTP_HOST, SMTP_EMAIL, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_EMAIL || !SMTP_PASSWORD) {
    throw new MailError("Email is not set up on the server (SMTP_HOST, SMTP_EMAIL, SMTP_PASSWORD). The reply was not sent.");
  }
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    // Never send credentials or mail unencrypted (a local test mail server on localhost is the only exception).
    requireTLS: port !== 465 && !/^(localhost|127\.0\.0\.1)$/.test(SMTP_HOST),
    ignoreTLS: /^(localhost|127\.0\.0\.1)$/.test(SMTP_HOST),
    auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD },
    connectionTimeout: 10000,
    socketTimeout: 15000,
  });
}

/** Turn low-level SMTP failures into a message the admin understands (no secrets included). */
function explain(error: any): MailError {
  const code = error?.code || "";
  if (code === "EDNS" || code === "ENOTFOUND") return new MailError(`The email server "${process.env.SMTP_HOST}" could not be found. Check SMTP_HOST. The reply was not sent.`);
  if (code === "EAUTH") return new MailError("The email server rejected the login. Check SMTP_EMAIL and SMTP_PASSWORD (for Gmail use an App Password). The reply was not sent.");
  if (code === "ETIMEDOUT" || code === "ECONNECTION" || code === "ESOCKET" || code === "ECONNREFUSED") return new MailError("Could not connect to the email server. Check SMTP_HOST and SMTP_PORT. The reply was not sent.");
  if (error?.responseCode >= 500) return new MailError("The email server refused the message. Check the visitor's address. The reply was not sent.");
  return new MailError("The email could not be sent. The reply was not saved; please try again.");
}

const fromAddress = () => `"Damarika" <${process.env.SMTP_EMAIL}>`;
/** Where visitors' answers to our reply should go (the business inbox). */
const replyToAddress = () => process.env.REPLY_TO_EMAIL || process.env.SMTP_EMAIL;

export async function sendContactReply(
  to: string,
  subject: string,
  text: string,
  original?: { name?: string; message?: string; date?: Date | string },
) {
  if (typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new MailError("This message has no valid email address to reply to.");
  }
  const mailer = transport();
  // Quote the visitor's original message under the reply, like a normal email client.
  const quoted = original?.message
    ? `\n\n----\nOn ${original.date ? new Date(original.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "your message"}, ${original.name || "you"} wrote:\n` +
      original.message.split(/\r?\n/).map((l) => "> " + l).join("\n")
    : "";
  const cleanSubject = (subject || "Your Damarika enquiry").replace(/[\r\n]+/g, " ").slice(0, 200);
  try {
    const result = await mailer.sendMail({
      from: fromAddress(),
      replyTo: replyToAddress(),
      to,
      subject: `Re: ${cleanSubject}`,
      text: `${text}${quoted}\n\n--\nDamarika · Tamil University Road, Thanjavur 613010 · https://damarika.in`,
    });
    if (!result.accepted.length) throw new MailError("The email server did not accept the message. The reply was not sent.");
    logger.info(`Contact reply sent (message id ${result.messageId})`);
  } catch (error) {
    if (error instanceof MailError) throw error;
    logger.error(`Contact reply failed: ${(error as any)?.code || ""} ${(error as Error)?.message}`);
    throw explain(error);
  }
}

/** Log in to the SMTP server without sending anything. Used at startup and by `npm run mail:check`. */
export async function verifyMail(): Promise<{ ok: boolean; message: string }> {
  try {
    await transport().verify();
    return { ok: true, message: `Email ready: logged in to ${process.env.SMTP_HOST} as ${process.env.SMTP_EMAIL}` };
  } catch (error) {
    const e = error instanceof MailError ? error : explain(error);
    return { ok: false, message: e.message.replace(" The reply was not sent.", "") };
  }
}
