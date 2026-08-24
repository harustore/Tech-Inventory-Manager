import { Pool } from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.resolve(rootDir, "artifacts/api-server/.env");

function parseEnvValue(content, key) {
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) {
    throw new Error(`${key} not found in env file`);
  }
  return match[1].trim().replace(/\s+/g, "");
}

const envContent = await fs.readFile(envPath, "utf8");
const databaseUrl = parseEnvValue(envContent, "DATABASE_URL");

const pool = new Pool({ connectionString: databaseUrl });

const statements = [
  `alter table if exists equipos add column if not exists buyer_name text`,
  `alter table if exists equipos add column if not exists buyer_rut text`,
  `alter table if exists equipos add column if not exists buyer_contact text`,
  `alter table if exists equipos add column if not exists meeting_place text`,
  `alter table if exists equipos add column if not exists buyer_payment_method text`,
  `alter table if exists equipos add column if not exists seller_name text`,
  `alter table if exists equipos add column if not exists seller_rut text`,
  `alter table if exists equipos add column if not exists seller_contact text`,
  `alter table if exists equipos add column if not exists purchase_meeting_place text`,
];

try {
  for (const statement of statements) {
    await pool.query(statement);
  }
  console.log(JSON.stringify({ repaired: true, addedColumns: statements.length }, null, 2));
} finally {
  await pool.end();
}
