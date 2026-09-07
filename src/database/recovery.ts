import bcrypt from "bcryptjs";
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { promisePool } from "./connection";
import { runMigrations, tables } from "./migration";

// Read only INSERT statements from the checked-in backup, never its legacy DDL.
// Semicolons inside quoted descriptions must not split a statement.
export function insertsFromDump(dump: string): string[] {
  const result: string[] = [];
  const startPattern = /^INSERT INTO `/gm;
  let match: RegExpExecArray | null;
  while ((match = startPattern.exec(dump))) {
    let quoted = false;
    let end = match.index;
    for (; end < dump.length; end++) {
      const char = dump[end];
      if (quoted && char === "\\") { end++; continue; }
      if (char === "'") {
        if (quoted && dump[end + 1] === "'") { end++; continue; }
        quoted = !quoted;
      }
      if (!quoted && char === ";") break;
    }
    if (end === dump.length) throw new Error("Unterminated backup INSERT");
    result.push(dump.slice(match.index, end + 1).replace(/'0000-00-00 00:00:00'/g, "NULL"));
    startPattern.lastIndex = end + 1;
  }
  if (!result.length) throw new Error("Backup has no INSERT statements");
  return result;
}

async function backupStatements() {
  const dump = await fs.readFile(path.resolve("src/DBBackUp/damarika_backend.sql"), "utf8");
  return insertsFromDump(dump);
}

async function generate() {
  const statements = await backupStatements();
  const sql = [
    "-- Damarika recovery from the April 5, 2026 backup. PRIVATE: contains user records.",
    "-- Import ONLY into a NEW EMPTY database selected in phpMyAdmin.",
    "-- Stop on any SQL error. Do not use --force. No DROP/TRUNCATE statements are included.",
    "SET NAMES utf8mb4;",
    ...tables.map(sql => sql.replace(" IF NOT EXISTS", "") + " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"),
    "START TRANSACTION;",
    ...statements,
    "COMMIT;",
    "-- Next: npm run migrate, then npm run admin:reset (see RECOVERY.md).",
  ].join("\n\n");
  await fs.mkdir("recovery", { recursive: true });
  await fs.writeFile("recovery/restore.sql", sql, { mode: 0o600 });
  console.log("Generated recovery/restore.sql. Import into an EMPTY database only.");
  console.log("Original backups are unchanged. Missing image files are not embedded in SQL.");
}

async function restore() {
  if (process.env.RESTORE_CONFIRM_DATABASE !== process.env.DB_NAME || !process.env.DB_NAME) {
    throw new Error("Set RESTORE_CONFIRM_DATABASE to your NEW DB_NAME before restoring.");
  }
  const [existing] = await promisePool.query<any[]>("SHOW TABLES");
  if (existing.length) throw new Error("Restore refused: target database is not empty. Use a new database.");
  const statements = await backupStatements();
  const connection = await promisePool.getConnection();
  try {
    for (const sql of tables) await connection.query(sql + " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    await connection.beginTransaction();
    for (const sql of statements) {
      try { await connection.query(sql); }
      catch (error: any) { console.error(`Failed restoring ${sql.match(/^INSERT INTO `(\w+)`/)?.[1]}: ${error.code}`); throw error; }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  await runMigrations();
  console.log("Backup content restored. Run admin:reset to establish your admin password.");
}

async function resetAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || Buffer.byteLength(password) > 72) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters, at most 72 UTF-8 bytes) in your private environment.");
  }
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("INSERT INTO roles (role_name, view_access, edit_access, delete_access, create_access, status) VALUES ('admin',true,true,true,true,true) ON CONFLICT (role_name) DO UPDATE SET status=true, view_access=true, edit_access=true, delete_access=true, create_access=true");
    const [roles] = await connection.query<any[]>("SELECT id FROM roles WHERE role_name='admin'");
    const hashed = await bcrypt.hash(password, 12);
    const [users] = await connection.query<any[]>("SELECT id FROM users WHERE email=? FOR UPDATE", [email]);
    if (users.length > 1) throw new Error("This email occurs more than once in the backup. Use a new admin email, then resolve duplicate accounts in the admin panel.");
    if (users.length) await connection.query("UPDATE users SET password=?,role_id=?,status=true,user_verify='verified',last_token=NULL WHERE id=?", [hashed, roles[0].id, users[0].id]);
    else await connection.query("INSERT INTO users (name,email,password,role_id,status,user_verify) VALUES (?,?,?,?,true,'verified')", [process.env.ADMIN_NAME || "Damarika Administrator", email, hashed, roles[0].id]);
    await connection.commit();
    console.log("Admin account is ready. Remove ADMIN_PASSWORD from the environment after use.");
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

async function main() {
  try {
    const command = process.argv[2];
    if (command === "generate") await generate();
    else if (command === "restore") await restore();
    else if (command === "admin") await resetAdmin();
    else throw new Error("Expected generate, restore, or admin");
  } catch (error: any) {
    // SQL driver errors can include full INSERTs containing private user data.
    console.error("Recovery failed:", error.message || error.code, error.detail || error.hint || "");
    process.exitCode = 1;
  } finally { await promisePool.end(); }
}
if (require.main === module) void main();
