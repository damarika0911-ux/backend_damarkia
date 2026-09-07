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
export function crudData(table: string, body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const key of writableFields[table]) {
    if (body[key] === undefined) continue;
    let value = body[key];
    if (["status", "isFeatured", "isUpcoming", "view_access", "create_access", "edit_access", "delete_access"].includes(key)) {
      if (![true, false, 0, 1, "true", "false", "0", "1"].includes(value as any)) throw new Error(`Invalid ${key}`);
      value = value === true || value === 1 || value === "true" || value === "1";
    }
    if (key === "image" && value && typeof value === "object") value = (value as any).url || "";
    if (value && typeof value === "object") value = JSON.stringify(value);
    if (["categoryId", "districtId", "role_id", "date"].includes(key) && value === "") value = null;
    if (key === "date" && typeof value === "string") {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) throw new Error("Invalid date");
      value = parsed.toISOString().slice(0, 19).replace("T", " ");
    }
    data[key] = value;
  }
  return data;
}
