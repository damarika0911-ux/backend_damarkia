import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { imageType } from "../routes/upload";

async function main() {
  const dump = await fs.readFile("src/DBBackUp/damarika_imagestore.sql", "utf8");
  const content = await fs.readFile("src/DBBackUp/damarika_backend.sql", "utf8");
  const urls = [...new Set((dump + content).match(/https:\/\/images\.damarika\.in\/uploads\/[a-zA-Z0-9_-]+\.(?:jpe?g|png|gif|webp)/g) || [])];
  const destination = path.resolve(process.env.UPLOAD_DIR || "uploads");
  await fs.mkdir(destination, { recursive: true });
  const results: { filename: string; status: string }[] = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      const filename = path.basename(new URL(url).pathname);
      const target = path.join(destination, filename);
      try {
        try { const existing = await fs.readFile(target); if (!imageType(existing)) throw new Error("Existing file is not a supported image"); results.push({ filename, status: "already present" }); continue; }
        catch (error: any) { if (error.code !== "ENOENT") throw error; }
        let buffer: Buffer;
        if (process.env.SOURCE_UPLOAD_DIR) {
          buffer = await fs.readFile(path.join(path.resolve(process.env.SOURCE_UPLOAD_DIR), filename));
        } else {
          const response = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: "error" });
          if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of response.body as any) {
            size += chunk.length;
            if (size > 10 * 1024 * 1024) throw new Error("File exceeds 10 MB");
            chunks.push(Buffer.from(chunk));
          }
          buffer = Buffer.concat(chunks);
        }
        if (!imageType(buffer)) throw new Error("Source did not contain an image (possibly a suspension page)");
        await fs.writeFile(target, buffer, { flag: "wx" });
        results.push({ filename, status: "recovered" });
      } catch (error: any) { results.push({ filename, status: `missing: ${error.code || error.message}` }); }
    }
  }));
  await fs.mkdir("recovery", { recursive: true });
  await fs.writeFile("recovery/image-report.json", JSON.stringify(results, null, 2));
  const missing = results.filter(row => row.status.startsWith("missing")).length;
  console.log(`${results.length - missing}/${results.length} images available. ${missing} missing. See recovery/image-report.json.`);
  if (missing) process.exitCode = 2;
}
void main().catch(error => { console.error("Image recovery failed:", error.message); process.exitCode = 1; });
