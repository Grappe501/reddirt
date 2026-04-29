/**
 * One-shot: append homepage + briefing TS excerpts before Sources marker.
 * Run: node scripts/append-kelly-bio-supplements.mjs
 */
import fs from "node:fs";

const BIO = "docs/kelly-grappe-comprehensive-biography-draft-for-chatgpt-polish.md";
const marker = "## Sources internal to this repository (for editors)";

const homepage = fs.readFileSync("src/content/homepage.ts", "utf8");
const trust = fs.readFileSync("src/content/background/strategic-messaging-trust-reform.ts", "utf8");
const youth = fs.readFileSync("src/content/background/youth-engagement-strategy.ts", "utf8");
const rock = fs.readFileSync("src/content/strategicThemes/rockefellerReform.ts", "utf8");

const block = `

---

## Appendix E — Homepage narrative rails (excerpt from \`src/content/homepage.ts\`)

*Included so polishing passes can align biography tone with public homepage themes.*

\`\`\`typescript
${homepage.slice(0, 8000)}
\`\`\`

---

## Appendix F — Internal assistant briefings (NOT autobiography)

*These modules train assistants/search; treat as parallel strategic context unless cross-referenced in Meet Kelly chapters.*

### Trust / dignity / reform (\`strategic-messaging-trust-reform.ts\`)

\`\`\`typescript
${trust}
\`\`\`

### Youth engagement strategy (\`youth-engagement-strategy.ts\`)

\`\`\`typescript
${youth}
\`\`\`

### Rockefeller-inspired reform theme lines (\`rockefellerReform.ts\`)

\`\`\`typescript
${rock}
\`\`\`

`;

let m = fs.readFileSync(BIO, "utf8");
if (!m.includes(marker)) throw new Error("marker missing");
if (m.includes("## Appendix E — Homepage narrative rails")) {
  console.log("Already appended; skip.");
  process.exit(0);
}
m = m.replace(marker, block + marker);
fs.writeFileSync(BIO, m);
const words = m.trim().split(/\s+/).filter(Boolean).length;
console.log("words:", words, "chars:", m.length);
