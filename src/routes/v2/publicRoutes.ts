import { Request, Response, Router } from "express";
import type { RowDataPacket } from "../../types/db";
import { promisePool } from "../../database/connection";
import { districtName } from "../../database/districtNames";
import { sendError, sendResponse } from "../../utils/responseHandler";
import { contactLimiter } from "../../middleware/rateLimits";
import { mediaFields } from "../../utils/media";
import { likePattern, pageMeta, pageParams, PageParams } from "../../utils/pagination";
import { cached } from "../../utils/publicCache";

const router = Router();

// Parse image field — DB may store as JSON string '{"url":"..."}' or plain URL
function parseImageUrl(image: any): string {
  if (!image) return "";
  if (typeof image === "object" && image.url) return image.url;
  if (typeof image === "string") {
    if (image.startsWith("{")) {
      try { return JSON.parse(image).url || image; } catch { }
    }
    return image;
  }
  return "";
}

// Public endpoints for the frontend website (no auth required).
//
// Every list endpoint is paginated:  ?limit=10&offset=0   (or ?page=2), optional ?q=search
// Response: { success, message, data: [...], meta: { total, limit, offset, hasMore, nextOffset } }
// GET is preferred (browser-cacheable, no CORS preflight). POST with the same params in the
// JSON body still works for older frontends.

/** Browsers may reuse a response for 60s and serve a stale copy for 10 min while refreshing. */
const PUBLIC_CACHE_HEADER = "public, max-age=60, stale-while-revalidate=600";

type Loader = (p: PageParams) => Promise<{ rows: any[]; total: number }>;

/** Run a paginated list query through the in-memory cache and send the standard response. */
function listHandler(name: string, message: string, load: Loader, limits: { defaultLimit?: number; maxLimit?: number } = {}) {
  return async (req: Request, res: Response) => {
    try {
      const p = pageParams(req, limits);
      const payload = await cached(`${name}|${p.limit}|${p.offset}|${p.q.toLowerCase()}`, async () => {
        const { rows, total } = await load(p);
        return { success: true, message, data: mediaFields(rows), meta: pageMeta(total, p, rows.length) };
      });
      if (req.method === "GET") res.set("Cache-Control", PUBLIC_CACHE_HEADER);
      res.json(payload);
    } catch (error: any) {
      sendResponse(res, 500, false, error.message);
    }
  };
}

/**
 * SELECT ... COUNT(*) OVER() returns the page and the total in one database round trip.
 * When the offset is past the end there is no row to carry the count, so count separately.
 */
async function pagedQuery(sql: { select: string; from: string; where: string; order: string }, params: unknown[], p: PageParams) {
  const [rows] = await promisePool.query<RowDataPacket[]>(
    `SELECT ${sql.select}, COUNT(*) OVER() AS total_count FROM ${sql.from} WHERE ${sql.where} ORDER BY ${sql.order} LIMIT ? OFFSET ?`,
    [...params, p.limit, p.offset],
  );
  let total = rows.length ? Number(rows[0].total_count) : 0;
  if (!rows.length && p.offset > 0) {
    const [c] = await promisePool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM ${sql.from} WHERE ${sql.where}`, params);
    total = Number(c[0]?.n || 0);
  }
  return { rows: rows.map(({ total_count, ...row }) => row), total };
}

/** Optional case-insensitive text search over the given columns. */
function searchClause(p: PageParams, cols: string[]) {
  if (!p.q) return { where: "", params: [] as unknown[] };
  const pattern = likePattern(p.q);
  return { where: " AND (" + cols.map((c) => `${c} ILIKE ?`).join(" OR ") + ")", params: cols.map(() => pattern) };
}

const PROGRAM_COLUMNS =
  "id, title, description, date, location, link, image, isfeatured, isupcoming, availabledates, sessions, duration, participants, modules";

// ---------- Programs ----------
const getPrograms = listHandler("program", "Programs fetched", async (p) => {
  const s = searchClause(p, ["title", "description", "modules"]);
  const { rows, total } = await pagedQuery({ select: PROGRAM_COLUMNS, from: "program", where: "status = true" + s.where, order: "id DESC" }, s.params, p);
  return { rows: rows.map((row) => ({ ...row, image: parseImageUrl(row.image) })), total };
});
router.get("/program", getPrograms);
router.post("/program", getPrograms);

router.get("/program/:id", async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id) || id < 1) return sendResponse(res, 400, false, "Invalid program id");
    const program = await cached(`program-by-id|${id}`, async () => {
      const [rows] = await promisePool.query<RowDataPacket[]>(`SELECT ${PROGRAM_COLUMNS} FROM program WHERE status = true AND id = ?`, [id]);
      return rows[0] ? { ...rows[0], image: parseImageUrl(rows[0].image) } : null;
    });
    if (!program) return sendResponse(res, 404, false, "Program not found");
    res.set("Cache-Control", PUBLIC_CACHE_HEADER);
    sendResponse(res, 200, true, "Program fetched", program);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

// ---------- Products ----------
const getProducts = listHandler("product", "Products fetched", async (p) => {
  const s = searchClause(p, ["p.title", "p.description"]);
  const { rows, total } = await pagedQuery(
    {
      select: "p.id, p.title, p.description, p.price, p.image, p.badge, p.link, pc.title AS categoryname",
      from: "products p LEFT JOIN product_categories pc ON p.categoryid = pc.id",
      where: "p.status = true" + s.where,
      order: "p.id DESC",
    },
    s.params,
    p,
  );
  return { rows: rows.map(({ categoryname, ...row }) => ({ ...row, categoryName: categoryname, image: parseImageUrl(row.image) })), total };
});
router.get("/product", getProducts);
router.post("/product", getProducts);

router.post("/contact/form", contactLimiter, async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    // Honeypot: a hidden "website" field real visitors never see. Bots fill it; pretend success, store nothing.
    if (typeof body.website === "string" && body.website.trim()) return sendResponse(res, 201, true, "Contact form submitted successfully");
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    // Strip control characters; single-line fields also lose line breaks (stops email header injection).
    const line = (v: unknown, max: number) => str(v).replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max + 1);
    const firstName = line(body.firstName, 100);
    const lastName = line(body.lastName, 100);
    const email = line(body.email, 254).toLowerCase();
    const subject = line(body.subject, 200);
    const message = str(body.message).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
    const problems: string[] = [];
    if (!firstName || firstName.length > 100) problems.push("first name (up to 100 characters)");
    if (lastName.length > 100) problems.push("last name (up to 100 characters)");
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) problems.push("a valid email address");
    if (subject.length > 200) problems.push("a subject of up to 200 characters");
    if (!message || message.length > 20000) problems.push("a message (up to 20,000 characters)");
    if (problems.length) return sendResponse(res, 400, false, `Please check: ${problems.join(", ")}.`);
    const name = `${firstName} ${lastName}`.trim();
    await promisePool.query(
      "INSERT INTO contact_form (name, reciever_email, sender_email, subject, message) VALUES (?, ?, ?, ?, ?)",
      [name, process.env.CONTACT_EMAIL || "support@damarika.in", email, subject, message]
    );
    sendResponse(res, 201, true, "Contact form submitted successfully");
  } catch (error) {
    sendError(res, error);
  }
});

// ---------- Archaeological sites (map) ----------
// The map draws every marker at once, so these allow a larger page (default 100, max 200).
const getSites = listHandler(
  "archeologist",
  "Archaeological sites fetched",
  async (p) => {
    const s = searchClause(p, ["a.name", "a.description"]);
    const { rows, total } = await pagedQuery(
      {
        select: "a.id, a.name, a.type, a.description, a.period, a.image, a.images, d.name AS district, d.centerx, d.centery",
        from: "archaeological_sites a LEFT JOIN district d ON a.districtid = d.id",
        where: "a.status = true" + s.where,
        order: "a.id DESC",
      },
      s.params,
      p,
    );
    // Shape the frontend map expects: { id, name, type, description, period, image, images, district, location: {x, y} }
    const sites = rows.map((row) => {
      let images: string[] = [];
      if (row.images) {
        try { images = JSON.parse(row.images); } catch { }
      }
      return {
        id: row.id,
        name: row.name,
        type: row.type || "cultural",
        description: row.description || "",
        period: row.period || "",
        image: parseImageUrl(row.image),
        images,
        district: districtName(row.district || ""),
        location: { x: parseFloat(row.centerX) || 0, y: parseFloat(row.centerY) || 0 },
      };
    });
    return { rows: sites, total };
  },
  { defaultLimit: 100, maxLimit: 200 },
);
router.get("/archeologist", getSites);
router.post("/archeologist", getSites);

// ---------- Districts (map) ----------
const getDistricts = listHandler(
  "district",
  "Districts fetched",
  async (p) => {
    const s = searchClause(p, ["name"]);
    const { rows, total } = await pagedQuery(
      { select: "id, name, description, images, notableplaces, centerx, centery", from: "district", where: "status = true" + s.where, order: "name ASC" },
      s.params,
      p,
    );
    const districts = rows.map((row) => {
      let images: string[] = [];
      if (row.images) {
        try { images = JSON.parse(row.images); } catch { }
      }
      let notablePlaces: string[] = [];
      if (row.notablePlaces) {
        try { notablePlaces = JSON.parse(row.notablePlaces); } catch { }
      }
      return {
        id: row.id,
        name: districtName(row.name),
        description: row.description || "",
        images,
        notablePlaces,
        center: { x: parseFloat(row.centerX) || 0, y: parseFloat(row.centerY) || 0 },
      };
    });
    return { rows: districts, total };
  },
  { defaultLimit: 100, maxLimit: 100 },
);
router.get("/district", getDistricts);
router.post("/district", getDistricts);

router.get("/countdown", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    // Target: April 14 of current year, or next year if already passed
    let targetYear = now.getFullYear();
    let target = new Date(targetYear, 3, 14, 0, 0, 0); // Month is 0-indexed: 3 = April
    if (now > target) {
      targetYear++;
      target = new Date(targetYear, 3, 14, 0, 0, 0);
    }

    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    sendResponse(res, 200, true, "Countdown fetched", {
      targetDate: target.toISOString(),
      eventName: "Tamil New Year (Puthandu)",
      serverTime: now.toISOString(),
      remaining: { days, hours, minutes, seconds },
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

router.get("/sitemap.xml", async (_req: Request, res: Response) => {
  try {
    const baseUrl = "https://damarika.in";
    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const pages = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/about", changefreq: "monthly", priority: "0.8" },
      { loc: "/services", changefreq: "monthly", priority: "0.8" },
      { loc: "/programs", changefreq: "weekly", priority: "0.9" },
      { loc: "/products", changefreq: "weekly", priority: "0.7" },
      { loc: "/contact", changefreq: "monthly", priority: "0.6" },
    ];

    const urls = pages.map(
      (p) =>
        `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

// ---------- Team ----------
const getPeople = listHandler("people", "People fetched", async (p) => {
  const { rows, total } = await pagedQuery(
    { select: "id, name, title, description, mobile, email, social_links, image", from: "peoples", where: "status = true", order: "id ASC" },
    [],
    p,
  );
  return {
    rows: rows.map((row) => {
      let socialLinks: { platform: string; url: string }[] = [];
      if (row.social_links) {
        try { socialLinks = JSON.parse(row.social_links); } catch { }
      }
      return { ...row, image: parseImageUrl(row.image), social_links: socialLinks };
    }),
    total,
  };
});
router.get("/people", getPeople);
router.post("/people", getPeople);

export default router;
