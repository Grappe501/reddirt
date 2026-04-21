/**
 * One-shot: public schema tables, row estimates, FK graph. Run from repo root: node scripts/db-inventory-oneshot.mjs
 * Loads `.env` then `.env.local` (later wins) for DATABASE_URL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const merged = new Map();
for (const name of [".env", ".env.local"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  let text = fs.readFileSync(p, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (const line of text.split("\n")) {
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/\\n/g, "\n");
    else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    merged.set(key, val);
  }
}
for (const [k, v] of merged) {
  process.env[k] = v;
}
if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is not set (.env / .env.local / environment).");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT c.relname AS name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
    ORDER BY c.relname
  `;

  const stats = await prisma.$queryRaw`
    SELECT relname AS name, n_live_tup::bigint AS est_rows
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY relname
  `;

  const fks = await prisma.$queryRaw`
    SELECT
      tc.table_name AS from_table,
      kcu.column_name AS from_col,
      ccu.table_name AS to_table,
      ccu.column_name AS to_col,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_schema = kcu.constraint_schema
     AND tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_schema = tc.constraint_schema
     AND ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name
  `;

  const colSample = await prisma.$queryRaw`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;

  console.log(
    JSON.stringify(
      { tables, stats, fks, columns: colSample },
      (_k, v) => (typeof v === "bigint" ? v.toString() : v),
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
