/**
 * Standalone migration script
 * Run: npx ts-node src/database/runMigration.ts
 * Or:  npm run migrate
 *
 * Safe to run multiple times — uses IF NOT EXISTS and INSERT IGNORE
 */
import dotenv from "dotenv";
dotenv.config();

import { promisePool } from "./connection";
import { runMigrations } from "./migration";

(async () => {
  console.log("Starting database migration...\n");
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl || /<project-ref>|<password>|PROJECT_REF|PASSWORD|REGION/i.test(databaseUrl)) {
    console.error("Migration cannot start: DATABASE_URL is missing or still contains placeholders.");
    console.error("Supabase: open Connect -> Connection String -> Transaction pooler, copy the URI, and replace DATABASE_URL in historyBack/.env.");
    process.exitCode = 1;
    await promisePool.end();
    return;
  }
  console.log("  Database: Supabase Postgres pooler");
  console.log(`  Storage: ${process.env.STORAGE_DRIVER || "local"}\n`);

  try {
    await runMigrations();
    console.log("\nMigration completed.");
  } catch (error: any) {
    console.error("Migration failed; database setup is incomplete.");
    console.error(`Reason: ${error?.message || "unknown database error"}`);
    process.exitCode = 1;
  } finally {
    await promisePool.end();
  }
})();
