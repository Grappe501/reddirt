/**
 * Append raw TS sources before "## What this draft deliberately does" for word-count + fidelity.
 * Run once: node scripts/append-kelly-bio-raw-sources.mjs
 */
import fs from "node:fs";

const BIO = "docs/kelly-grappe-comprehensive-biography-draft-for-chatgpt-polish.md";
const MARKER = "## What this draft deliberately does **not** claim";

const fm = fs.readFileSync("src/content/background/forevermost-farms.ts", "utf8");
const su = fs.readFileSync("src/content/background/stand-up-arkansas.ts", "utf8");
const ingest = fs.readFileSync("scripts/ingest-docs.ts", "utf8");
const ingestSlice = ingest.slice(
  ingest.indexOf("const pageSeeds = ["),
  ingest.indexOf("];", ingest.indexOf("const pageSeeds = [")) + 2,
);

let m = fs.readFileSync(BIO, "utf8");
if (m.includes("## Appendix G — Raw source modules (full campaign TS excerpts)")) {
  console.log("Already raw-appended; skip.");
  process.exit(0);
}

const block = `

---

## Appendix G — Raw source modules (full campaign TS excerpts)

*Duplicative with structured narrative above; included so polish passes can mine wording directly.*

### \`src/content/background/forevermost-farms.ts\`

\`\`\`typescript
${fm}
\`\`\`

### \`src/content/background/stand-up-arkansas.ts\`

\`\`\`typescript
${su}
\`\`\`

### \`scripts/ingest-docs.ts\` — \`pageSeeds\` array excerpt

\`\`\`typescript
${ingestSlice}
\`\`\`

`;

if (!m.includes(MARKER)) throw new Error("marker missing");
m = m.replace(MARKER, block + MARKER);
fs.writeFileSync(BIO, m);
const words = m.trim().split(/\s+/).filter(Boolean).length;
console.log("words:", words);
