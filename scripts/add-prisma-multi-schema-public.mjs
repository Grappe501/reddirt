/**
 * Idempotent: add generator `multiSchema` preview, datasource `schemas`, + @@schema("public")
 * on every model/enum missing it (Supabase migrate dev P4002: public → auth.users FK).
 * Safe to re-run; no-ops when already applied.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = path.join(__dirname, "../prisma/schema.prisma");

function injectPublicSchema(body) {
  if (body.includes("@@schema(")) return body;
  const lines = body.split("\n");
  let firstDirective = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("@@")) {
      firstDirective = i;
      break;
    }
  }
  const insert = `  @@schema("public")`;
  if (firstDirective >= 0) {
    lines.splice(firstDirective, 0, insert);
  } else {
    let insertAt = lines.length;
    while (insertAt > 0 && lines[insertAt - 1].trim() === "") insertAt--;
    lines.splice(insertAt, 0, insert);
  }
  return lines.join("\n");
}

function processBlocks(src, keyword) {
  const re = new RegExp(`^${keyword}\\s+\\w+\\s+\\{`, "gm");
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    out += src.slice(last, m.index);
    const start = m.index;
    const openBrace = src.indexOf("{", start);
    let depth = 0;
    let i = openBrace;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const inner = src.slice(openBrace + 1, i);
          const newInner = injectPublicSchema(inner);
          out += src.slice(start, openBrace + 1) + newInner + "}";
          last = i + 1;
          re.lastIndex = last;
          break;
        }
      }
    }
  }
  out += src.slice(last);
  return out;
}

let s = fs.readFileSync(SCHEMA, "utf8");

if (!s.includes("previewFeatures") || !s.includes("multiSchema")) {
  s = s.replace(
    /(generator client \{[^}]*binaryTargets\s*=\s*\[[^\]]+\])\s*\n(\})/,
    '$1\n  previewFeatures = ["multiSchema"]\n$2'
  );
}

if (!s.includes('schemas = ["public", "auth"]')) {
  const replaced = s.replace(
    /(directUrl = env\("DIRECT_URL"\))\s*\n(\})/,
    '$1\n  schemas   = ["public", "auth"]\n$2'
  );
  if (replaced === s) {
    console.error("Could not inject schemas into datasource db");
    process.exit(1);
  }
  s = replaced;
}

s = processBlocks(s, "model");
s = processBlocks(s, "enum");

fs.writeFileSync(SCHEMA, s, "utf8");
console.log("OK: datasource schemas + @@schema(public) on models/enums");
