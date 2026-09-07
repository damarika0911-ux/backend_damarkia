export function imageUrl(value: unknown): string {
  if (!value) return "";
  if (typeof value === "object") return imageUrl((value as { url?: unknown }).url);
  if (typeof value !== "string") return "";
  if (value.startsWith("{") || value.startsWith('"')) {
    try { return imageUrl(JSON.parse(value)); } catch { return ""; }
  }
  const legacy = value.match(/^https?:\/\/(?:images\.damarika\.in\/uploads\/|api\.damarika\.in\/api\/images\/uploads\/)([^/?#]+)$/);
  const base = process.env.PUBLIC_API_URL?.replace(/\/+$/, "");
  if (legacy && base) return `${base}/api/images/uploads/${legacy[1]}`;
  return value;
}

export function mediaFields(value: any): any {
  if (Array.isArray(value)) return value.map(mediaFields);
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  const result = { ...value };
  if ("image" in result) result.image = imageUrl(result.image);
  if (result.images) {
    try {
      const images = typeof result.images === "string" ? JSON.parse(result.images) : result.images;
      if (Array.isArray(images)) result.images = images.map(imageUrl);
    } catch { result.images = []; }
  }
  return result;
}
