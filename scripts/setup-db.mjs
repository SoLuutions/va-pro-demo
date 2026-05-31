import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "schema.sql");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.vapro_POSTGRES_URL_NON_POOLING ||
  process.env.vapro_POSTGRES_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL or vapro_POSTGRES_URL_NON_POOLING in .env");
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Database schema applied successfully.");
} catch (error) {
  console.error("Failed to apply schema:", error.message);
  process.exit(1);
} finally {
  await client.end();
}
