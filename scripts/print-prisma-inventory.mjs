import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(__dirname, "../prisma/schema.prisma"), "utf8");
const lines = schema.split("\n");
const models = [];
for (let i = 0; i < lines.length; i++) {
  const m = /^model (\w+) \{/.exec(lines[i]);
  if (m) models.push(m[1]);
}
models.sort();
console.log(JSON.stringify({ count: models.length, models }, null, 0));
