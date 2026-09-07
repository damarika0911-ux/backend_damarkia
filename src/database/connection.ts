import dotenv from "dotenv";
dotenv.config();

import { Pool, PoolConfig } from "pg";
import logger from "../utils/logger";

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  ssl: process.env.DB_SSL !== "false" ? { rejectUnauthorized: false } : undefined,
};

const pool = new Pool(config);

const outputNames: Record<string, string> = {
  phonenumber: "phoneNumber", roleid: "role_id", categoryid: "categoryId", districtid: "districtId",
  createdby: "created_by", updatedby: "updated_by", createdat: "createdAt", updatedat: "updatedAt",
  userverify: "user_verify", lasttoken: "last_token", isfeatured: "isFeatured", isupcoming: "isUpcoming",
  availabledates: "availableDates", recieveremail: "reciever_email", senderemail: "sender_email",
  isreplied: "isReplied", repliedmessage: "repliedMessage", replydate: "replyDate", notableplaces: "notablePlaces",
  centerx: "centerX", centery: "centerY", sociallinks: "social_links",
};

function mapRows(rows: Record<string, unknown>[]) {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [outputNames[key] || key, value])));
}

function postgresSql(sql: string) {
  let index = 0;
  return sql.replace(/`/g, "").replace(/\?/g, () => `$${++index}`).replace(/\bNOW\(\)/gi, "CURRENT_TIMESTAMP");
}

export const promisePool = {
  async query<T = Record<string, unknown>[]>(sql: string, values: unknown[] = []): Promise<[T, any]> {
    const isInsert = /^\s*INSERT\b/i.test(sql);
    const preparedSql = isInsert && !/\bRETURNING\b/i.test(sql) ? `${postgresSql(sql)} RETURNING id` : postgresSql(sql);
    const result = await pool.query(preparedSql, values);
    const rows = mapRows(result.rows);
    const metadata = { affectedRows: result.rowCount || 0, insertId: isInsert && rows[0] ? (rows[0] as any).id : undefined };
    return [((isInsert || /^\s*(UPDATE|DELETE)\b/i.test(sql)) ? metadata : rows) as T, metadata];
  },
  async getConnection() {
    const client = await pool.connect();
    return {
      threadId: "supabase",
      query: async <T = Record<string, unknown>[]>(sql: string, values: unknown[] = []) => {
        const isInsert = /^\s*INSERT\b/i.test(sql);
        const preparedSql = isInsert && !/\bRETURNING\b/i.test(sql) ? `${postgresSql(sql)} RETURNING id` : postgresSql(sql);
        const result = await client.query(preparedSql, values);
        const rows = mapRows(result.rows);
        const metadata = { affectedRows: result.rowCount || 0, insertId: isInsert && rows[0] ? (rows[0] as any).id : undefined };
        return [((isInsert || /^\s*(UPDATE|DELETE)\b/i.test(sql)) ? metadata : rows) as T, metadata] as [T, any];
      },
      beginTransaction: () => client.query("BEGIN"),
      commit: () => client.query("COMMIT"),
      rollback: () => client.query("ROLLBACK"),
      release: () => client.release(),
    };
  },
  async end() { await pool.end(); },
};

// Test connection on startup with retry
async function testConnection(retries = 3, delay = 5000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await promisePool.getConnection();
      logger.info(
        `Database connected successfully (thread ${connection.threadId})`
      );
      connection.release();
      return;
    } catch (error: any) {
      logger.error(
        `DB connection attempt ${attempt}/${retries} failed: ${error.message}`
      );
      if (attempt < retries) {
        logger.info(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  logger.error(
    "All DB connection attempts failed. Server running but DB queries will fail."
  );
}

export { testConnection };

export default pool;
