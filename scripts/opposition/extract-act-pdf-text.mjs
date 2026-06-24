import fs from "node:fs";
import pdf from "pdf-parse";

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("Usage: node extract-act-pdf-text.mjs <path-to-pdf>");
  process.exit(1);
}
const buf = fs.readFileSync(pdfPath);
const data = await pdf(buf);
console.log(data.text);
