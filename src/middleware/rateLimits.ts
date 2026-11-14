import { BlockList, isIPv4, isIPv6 } from "node:net";
import { Request } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { sendResponse } from "../utils/responseHandler";

/**
 * Cloudflare's published edge ranges (https://www.cloudflare.com/ips/).
 * A request whose connecting IP is one of these came through Cloudflare, so its
 * CF-Connecting-IP header (set by Cloudflare, not the client) is the real visitor.
 * Anyone calling the Render URL directly cannot fake it: their connecting IP is not Cloudflare's.
 */
const CLOUDFLARE = new BlockList();
for (const cidr of [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18",
  "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
  "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
]) {
  const [net, bits] = cidr.split("/");
  CLOUDFLARE.addSubnet(net, Number(bits), "ipv4");
}
for (const cidr of ["2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32"]) {
  const [net, bits] = cidr.split("/");
  CLOUDFLARE.addSubnet(net, Number(bits), "ipv6");
}

const strip = (ip: string) => ip.replace(/^::ffff:/, "");
const isCloudflare = (ip: string) => {
  const v = strip(ip);
  return (isIPv4(v) && CLOUDFLARE.check(v, "ipv4")) || (isIPv6(v) && CLOUDFLARE.check(v, "ipv6"));
};

/** The visitor's real IP. Requires app.set("trust proxy", 1) on Render (see index.ts). */
export function clientIp(req: Request): string {
  const connecting = strip(req.ip || req.socket.remoteAddress || "");
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && isCloudflare(connecting) && (isIPv4(cf) || isIPv6(cf))) return cf;
  return connecting;
}

// IPv6 addresses are grouped by /56 so one machine can't rotate through its own range.
const keyGenerator = (req: Request) => ipKeyGenerator(clientIp(req), 56);

const limiter = (windowMs: number, limit: number, message: string, extra: Partial<Parameters<typeof rateLimit>[0]> = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator,
    handler: (_req, res) => sendResponse(res, 429, false, message),
    ...extra,
  });

/** Everything under /api: generous, stops floods and scrapers. Public reads are cached, so this is cheap. */
export const apiLimiter = limiter(60 * 1000, 300, "Too many requests. Please slow down and try again in a minute.");

/** Login: 10 failed attempts per 15 minutes per visitor. Successful logins don't count. */
export const loginLimiter = limiter(15 * 60 * 1000, 10, "Too many sign-in attempts. Please wait 15 minutes and try again.", {
  skipSuccessfulRequests: true,
});

/** Contact form: 5 messages per 15 minutes per visitor. */
export const contactLimiter = limiter(15 * 60 * 1000, 5, "You've sent several messages in a short time. Please wait 15 minutes and try again.");

/** Admin uploads: 60 images per 10 minutes per signed-in session/IP. */
export const uploadLimiter = limiter(10 * 60 * 1000, 60, "Too many uploads. Please wait a few minutes.");
