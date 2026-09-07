import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Router } from "express";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { auth } from "../middleware/auth";

const router = Router();
const driver = process.env.STORAGE_DRIVER || "local";
const directory = path.resolve(process.env.UPLOAD_DIR || "uploads");
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase: SupabaseClient | null = driver === "supabase" && process.env.SUPABASE_URL && supabaseSecret
  ? createClient(process.env.SUPABASE_URL, supabaseSecret, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const s3 = driver === "r2" ? new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
}) : null;

export function validateStorage() {
  if (!["local", "r2", "supabase"].includes(driver)) throw new Error("STORAGE_DRIVER must be local, r2 or supabase");
  if (driver === "r2" && ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"].some(key => !process.env[key])) throw new Error("R2 storage configuration is incomplete");
  if (driver === "supabase" && (!supabase || !process.env.SUPABASE_URL)) throw new Error("Supabase Storage configuration is incomplete");
}

// Derive the extension and MIME type from the bytes, never the submitted filename.
export function imageType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { ext: ".png", mime: "image/png" };
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return { ext: ".jpg", mime: "image/jpeg" };
  if (["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString())) return { ext: ".gif", mime: "image/gif" };
  if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return { ext: ".webp", mime: "image/webp" };
  return null;
}
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 2 } });

router.post("/upload", auth, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Choose an image" });
    const type = imageType(req.file.buffer);
    if (!type) return res.status(400).json({ success: false, message: "Use a JPEG, PNG, GIF or WebP image" });
    const filename = crypto.randomBytes(16).toString("hex") + type.ext;
    if (supabase) {
      const { error } = await supabase.storage.from("uploads").upload(filename, req.file.buffer, { contentType: type.mime, upsert: false });
      if (error) throw error;
    } else if (s3) await s3.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: `uploads/${filename}`, Body: req.file.buffer, ContentType: type.mime }));
    else {
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, filename), req.file.buffer, { flag: "wx" });
    }
    const base = process.env.PUBLIC_API_URL!.replace(/\/+$/, "");
    const url = supabase ? `${process.env.SUPABASE_URL!.replace(/\/+$/, "")}/storage/v1/object/public/uploads/${filename}` : `${base}/api/images/uploads/${filename}`;
    res.json({ success: true, message: "Image uploaded successfully", url });
  } catch (error) { next(error); }
});

router.get("/images/uploads/:filename", async (req, res, next) => {
  const filename = String(req.params.filename);
  if (!/^[a-zA-Z0-9_-]+\.(?:jpe?g|png|gif|webp)$/i.test(filename)) return res.sendStatus(404);
  try {
    res.setHeader("Cache-Control", "public, max-age=86400");
    if (supabase) return res.redirect(`${process.env.SUPABASE_URL!.replace(/\/+$/, "")}/storage/v1/object/public/uploads/${filename}`);
    if (s3) {
      const result = await s3.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: `uploads/${filename}` }));
      res.type(path.extname(filename));
      await pipeline(result.Body as Readable, res);
    } else {
      await fs.access(path.join(directory, filename));
      res.sendFile(path.join(directory, filename), error => { if (error) next(error); });
    }
  } catch (error: any) {
    if (error.code === "ENOENT" || error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) return res.status(404).json({ success: false, message: "Image not found" });
    next(error);
  }
});
export default router;
