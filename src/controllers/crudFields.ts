import { ValidationError } from "../utils/responseHandler";

export const writableFields: Record<string, string[]> = {
  products: ["title", "description", "price", "image", "badge", "link", "categoryId", "status"],
  product_categories: ["title", "description", "image", "status"],
  program: ["title", "description", "date", "location", "link", "image", "isFeatured", "isUpcoming", "availableDates", "sessions", "duration", "participants", "modules", "status"],
  peoples: ["name", "title", "description", "mobile", "email", "social_links", "image", "role_id", "status"],
  district: ["name", "path", "centerX", "centerY", "description", "images", "notablePlaces", "status"],
  archaeological_sites: ["name", "type", "description", "period", "image", "images", "districtId", "status"],
  roles: ["role_name", "view_access", "edit_access", "delete_access", "create_access", "status"],
  contact_form: ["name", "reciever_email", "sender_email", "subject", "message", "status"],
  users: [],
};
/** Only web, email, phone and WhatsApp links may be saved, so a link can never run script (e.g. "javascript:"). */
export function safeUrl(value: unknown, field: string, { allowContact = true } = {}): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") throw new ValidationError(`${field} must be a link`);
  let v = value.trim();
  // Legacy formats: {"url":"..."} JSON strings, and "," used by the old admin for "no link".
  if (v.startsWith("{")) { try { v = String(JSON.parse(v).url || "").trim(); } catch { /* validated below */ } }
  if (v === "" || v === ",") return "";
  if (v.length > 2000) throw new ValidationError(`${field} is too long`);
  let url: URL;
  try { url = new URL(v); } catch { throw new ValidationError(`${field} must be a full link starting with https://`); }
  const allowed = allowContact ? ["http:", "https:", "mailto:", "tel:"] : ["http:", "https:"];
  if (!allowed.includes(url.protocol)) throw new ValidationError(`${field} must start with https://`);
  return v;
}

/** Remove control characters (keeps newlines and tabs) and cap length. */
export function cleanText(value: unknown, field: string, max: number): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string" && typeof value !== "number") throw new ValidationError(`Invalid ${field}`);
  const v = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (v.length > max) throw new ValidationError(`${field} must be at most ${max} characters`);
  return v;
}

const TEXT_LIMITS: Record<string, number> = { description: 20000, modules: 5000, path: 200000 };

export function crudData(table: string, body: Record<string, unknown>) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ValidationError("Invalid request body");
  const data: Record<string, unknown> = {};
  for (const key of writableFields[table]) {
    if (body[key] === undefined) continue;
    let value = body[key];
    if (["status", "isFeatured", "isUpcoming", "view_access", "create_access", "edit_access", "delete_access"].includes(key)) {
      if (![true, false, 0, 1, "true", "false", "0", "1"].includes(value as any)) throw new ValidationError(`Invalid ${key}`);
      value = value === true || value === 1 || value === "true" || value === "1";
    }
    if (key === "image" && value && typeof value === "object") value = (value as any).url || "";
    if (key === "image") value = safeUrl(value, "Image", { allowContact: false }) || null;
    if (key === "link") value = safeUrl(value, "Link") || null;
    if (key === "images") {
      let list: unknown = value;
      if (typeof list === "string") { try { list = JSON.parse(list || "[]"); } catch { throw new ValidationError("Invalid images"); } }
      if (!Array.isArray(list) || list.length > 30) throw new ValidationError("Images must be a list of up to 30 links");
      value = list.map((u) => safeUrl(typeof u === "object" && u ? (u as any).url : u, "Image", { allowContact: false })).filter(Boolean);
    }
    if (key === "social_links") {
      let list: unknown = value;
      if (typeof list === "string") { try { list = JSON.parse(list || "[]"); } catch { throw new ValidationError("Invalid social links"); } }
      if (!Array.isArray(list) || list.length > 20) throw new ValidationError("Social links must be a list");
      value = list.map((l: any) => ({ platform: cleanText(l?.platform, "Platform", 50), url: safeUrl(l?.url, "Social link") })).filter((l) => l.url);
    }
    if (typeof value === "string" && !["image", "link"].includes(key)) value = cleanText(value, key, TEXT_LIMITS[key] ?? 255);
    if (value && typeof value === "object") value = JSON.stringify(value);
    if (["categoryId", "districtId", "role_id", "date"].includes(key) && value === "") value = null;
    if (key === "date" && typeof value === "string") {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) throw new ValidationError("Invalid date");
      value = parsed.toISOString().slice(0, 19).replace("T", " ");
    }
    data[key] = value;
  }
  return data;
}
