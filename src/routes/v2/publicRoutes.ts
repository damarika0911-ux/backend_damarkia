import { Request, Response, Router } from "express";
import { rateLimit } from "express-rate-limit";
import { RowDataPacket } from "mysql2";
import { promisePool } from "../../database/connection";
import { districtName } from "../../database/districtNames";
import { sendResponse } from "../../utils/responseHandler";

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

// Public endpoints for the frontend website (no auth required)
// Frontend uses POST for all reads (matching existing frontend apiService)

const getPrograms = async (_req: Request, res: Response) => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>(
      "SELECT * FROM program WHERE status = true ORDER BY id DESC"
    );
    const programs = rows.map((row) => ({ ...row, image: parseImageUrl(row.image) }));
    sendResponse(res, 200, true, "Programs fetched", programs);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
router.get("/program", getPrograms);
router.post("/program", getPrograms);

router.post("/product", async (_req: Request, res: Response) => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>(
      "SELECT p.*, pc.title as categoryName FROM products p LEFT JOIN product_categories pc ON p.categoryId = pc.id WHERE p.status = true ORDER BY p.id DESC"
    );
    const products = rows.map((row) => ({ ...row, image: parseImageUrl(row.image) }));
    sendResponse(res, 200, true, "Products fetched", products);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

router.post("/contact/form", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }), async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;
    if (typeof firstName !== "string" || !firstName.trim() || (lastName !== undefined && typeof lastName !== "string") || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof subject !== "string" || subject.length > 255 || typeof message !== "string" || !message.trim() || message.length > 20000) return sendResponse(res, 400, false, "Enter your name, valid email, subject and message (up to 20,000 characters)");
    const name = `${firstName} ${lastName || ""}`.trim();
    await promisePool.query(
      "INSERT INTO contact_form (name, reciever_email, sender_email, subject, message) VALUES (?, ?, ?, ?, ?)",
      [name, process.env.CONTACT_EMAIL || "support@damarika.in", email, subject, message]
    );
    sendResponse(res, 201, true, "Contact form submitted successfully");
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

router.post("/archeologist", async (_req: Request, res: Response) => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>(
      `SELECT a.id, a.name, a.type, a.description, a.period, a.image, a.images,
              d.name as district, d.centerX, d.centerY
       FROM archaeological_sites a
       LEFT JOIN district d ON a.districtId = d.id
       WHERE a.status = true ORDER BY a.id DESC`
    );

    // Transform to the shape the frontend map expects:
    // { id, name, type, description, period, image, district, location: {x, y} }
    const sites = rows.map((row) => {
      let imageUrl = row.image || "";
      // Parse if image is stored as JSON
      if (imageUrl && typeof imageUrl === "string") {
        try {
          const parsed = JSON.parse(imageUrl);
          imageUrl = parsed.url || parsed || imageUrl;
        } catch { }
      }

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
        image: imageUrl,
        images,
        district: districtName(row.district || ""),
        location: {
          x: parseFloat(row.centerX) || 0,
          y: parseFloat(row.centerY) || 0,
        },
      };
    });

    sendResponse(res, 200, true, "Archaeological sites fetched", sites);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

router.post("/district", async (_req: Request, res: Response) => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>(
      "SELECT id, name, description, images, notablePlaces, centerX, centerY FROM district WHERE status = true ORDER BY name ASC"
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
    sendResponse(res, 200, true, "Districts fetched", districts);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

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
    const baseUrl = "https://www.damarika.in";
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

router.post("/people", async (_req: Request, res: Response) => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>(
      "SELECT * FROM peoples WHERE status = true ORDER BY id ASC"
    );
    const people = rows.map((row) => {
      let socialLinks: { platform: string; url: string }[] = [];
      if (row.social_links) {
        try { socialLinks = JSON.parse(row.social_links); } catch { }
      }
      return { ...row, image: parseImageUrl(row.image), social_links: socialLinks };
    });
    sendResponse(res, 200, true, "People fetched", people);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

export default router;
