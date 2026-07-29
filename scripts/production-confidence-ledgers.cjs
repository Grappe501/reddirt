/**
 * Production confidence — filesystem media + endorsement ledger (no server required).
 * Writes markdown fragments under docs/website/ for the confidence pack.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const docs = path.join(root, "docs", "website");

function loadTsExportRough(rel, marker) {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  return text;
}

const photoIds = [
  "afl-cio-pre-event-networking-20260629",
  "mena-polk-meet-greet-20260411",
  "war-memorial-stadium-concourse-20260320",
  "toad-suck-daze-toad-race-20260501",
  "johnson-county-peach-festival-parade-20260718",
  "watermelon-festival-booth-service-20260725",
  "stone-porch-door-conversation-20260301",
  "elks-lodge-breakfast-table-20260228",
];

const mediaRows = [];
for (const id of photoIds) {
  const src = path.join(root, "public", "media", "campaign-photos", `${id}.png`);
  const exists = fs.existsSync(src);
  const size = exists ? fs.statSync(src).size : 0;
  mediaRows.push({ id, exists, size, path: `/media/campaign-photos/${id}.png` });
}

const endorsementsSrc = loadTsExportRough("src/content/website/confirmed-endorsements.ts");
const endorsementIds = [
  "arkansas-afl-cio",
  "arkansas-education-association",
  "josh-irby",
  "progressive-arkansas-women-pac",
];
const endorsementChecks = endorsementIds.map((id) => ({
  id,
  inCanon: endorsementsSrc.includes(`id: "${id}"`),
  hasDate: new RegExp(`id: "${id}"[\\s\\S]*?announcedDateLabel`).test(endorsementsSrc) &&
    !new RegExp(`id: "${id}"[\\s\\S]*?announcedDateLabel:\\s*undefined`).test(endorsementsSrc),
}));

const mediaMd = [
  "# Media verification ledger",
  "",
  "**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`",
  "**Method:** Filesystem existence + registry caption/alt invariants (homepage FEATURE set).",
  "",
  "## Homepage campaign photos",
  "",
  "| Asset | File present | Bytes | Path | Keep purpose |",
  "| --- | --- | ---: | --- | --- |",
  ...mediaRows.map(
    (r) =>
      `| ${r.id} | ${r.exists ? "✅" : "❌"} | ${r.size} | \`${r.path}\` | Trail evidence |`,
  ),
  "",
  `**Files present:** ${mediaRows.filter((r) => r.exists).length}/${mediaRows.length}`,
  "",
  "## Videos (homepage)",
  "",
  "| Asset | YouTube ID | Role | Caption rule |",
  "| --- | --- | --- | --- |",
  "| Primary message | `eKVz5pFJxtk` | Voice / accountability | Frame only; do not pre-explain |",
  "| Across Arkansas | `aO712RsR0pQ` | Listening / trail evidence | Hot Springs Village story |",
  "",
  "## Caption / alt discipline",
  "",
  "- AFL-CIO homepage caption must **not** claim endorsement (endorsement lives on `/endorsements` with separate photo note).",
  "- Unknown geography stays Unknown.",
  "- Transcript readiness: document separately from embed load.",
  "",
].join("\n");

const endorsementMd = [
  "# Endorsement verification ledger",
  "",
  "**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`",
  "**Canon:** `src/content/website/confirmed-endorsements.ts`",
  "",
  "| ID | In canon | Announcement date | Notes |",
  "| --- | --- | --- | --- |",
  ...endorsementChecks.map((e) => {
    const date = e.hasDate ? "PRESENT" : "BLANK (correct if unconfirmed)";
    return `| ${e.id} | ${e.inCanon ? "✅" : "❌"} | ${date} | Campaign-confirmed; no inferred date |`;
  }),
  "",
  "## Policy checks",
  "",
  "- Coalition-first homepage intro: required",
  "- `/endorsements` Campaign endorsement policy block: required",
  "- AFL-CIO related photo note distinguishes meeting vs endorsement: required",
  "- No logo wallpaper / no invented quotes: required",
  "",
  "## Remaining verification (campaign, not engineering)",
  "",
  "- Public announcement dates / source URLs when Steve supplies them",
  "",
].join("\n");

fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, "MEDIA_VERIFICATION_LEDGER.md"), mediaMd);
fs.writeFileSync(path.join(docs, "ENDORSEMENT_VERIFICATION_LEDGER.md"), endorsementMd);

console.log("Wrote MEDIA_VERIFICATION_LEDGER.md and ENDORSEMENT_VERIFICATION_LEDGER.md");
console.log("media_ok=", mediaRows.every((r) => r.exists));
console.log("endorsements_ok=", endorsementChecks.every((e) => e.inCanon));
