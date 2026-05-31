import fs from "fs";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Prefer IPv4 — Supabase hostnames often resolve to IPv6 first, which fails on some networks.
dns.setDefaultResultOrder("ipv4first");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "schema.sql");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.vapro_POSTGRES_URL_NON_POOLING ||
  process.env.vapro_POSTGRES_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

async function toIpv4ConnectionString(connStr) {
  try {
    const url = new URL(connStr);
    const host = url.hostname;
    if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return connStr;

    const { address } = await dns.promises.lookup(host, { family: 4 });
    url.hostname = address;
    console.log(`Resolved ${host} → ${address} (IPv4)`);
    return url.toString();
  } catch {
    return connStr;
  }
}

const sql = fs.readFileSync(sqlPath, "utf8");
const ipv4Url = await toIpv4ConnectionString(connectionString);
// Strip sslmode from URL so our ssl config is used (avoids cert chain errors with pooler).
const cleanUrl = ipv4Url
  .replace(/([?&])sslmode=[^&]*&?/g, "$1")
  .replace(/[?&]$/, "");

const client = new pg.Client({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Database schema applied successfully.");
} catch (error) {
  console.error("Failed to apply schema:", error.message);
  console.error("\nIf this keeps failing, paste supabase/schema.sql into the Supabase SQL Editor instead:");
  console.error("https://supabase.com/dashboard/project/onygfnhapuzjrknwbian/sql");
  process.exit(1);
} finally {
  await client.end();
}
