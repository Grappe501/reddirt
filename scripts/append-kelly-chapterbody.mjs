/**
 * Append KellyChapterBody.tsx raw source for additional verbatim fidelity (~thousands of tokens).
 * node scripts/append-kelly-chapterbody.tsx-append.mjs
 */
import fs from "node:fs";

const BIO = "docs/kelly-grappe-comprehensive-biography-draft-for-chatgpt-polish.md";
const MARKER = "## What this draft deliberately does **not** claim";

const src = fs.readFileSync("src/components/about/KellyChapterBody.tsx", "utf8");

let m = fs.readFileSync(BIO, "utf8");
if (m.includes("## Appendix H — `KellyChapterBody.tsx` (verbatim component source)")) {
  console.log("Already appended KellyChapterBody; skip.");
  process.exit(0);
}

const block = `

---

## Appendix H — \`KellyChapterBody.tsx\` (verbatim component source)

*This duplicates Appendix A in JSX form—helpful if polishing passes compare JSX branching.*

\`\`\`tsx
${src}
\`\`\`

`;

if (!m.includes(MARKER)) throw new Error("marker missing");
m = m.replace(MARKER, block + MARKER);
fs.writeFileSync(BIO, m);
console.log("words:", m.trim().split(/\s+/).filter(Boolean).length);
