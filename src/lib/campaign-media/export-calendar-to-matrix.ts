import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { CalendarPresenceStore } from "@/lib/campaign-media/evidence-types";

const MATRIX_REL = "docs/website/ARKANSAS_PRESENCE_MATRIX.md";
const SECTION_START = "## Calendar inventory (pending Steve confirmation)";
const SECTION_END = "## Public-site";

/**
 * Replace the Calendar inventory section in Presence Matrix from Confirmed rows only.
 */
export function exportConfirmedCalendarToPresenceMatrix(store: CalendarPresenceStore): {
  ok: true;
  confirmedCount: number;
} | { ok: false; error: string } {
  const abs = path.join(process.cwd(), MATRIX_REL);
  if (!existsSync(abs)) {
    return { ok: false, error: `Missing ${MATRIX_REL}` };
  }
  const confirmed = store.rows.filter((r) => r.status === "Confirmed");
  const uniqueCounties = new Set(
    confirmed.map((r) => r.county.trim()).filter((c) => c && c.toLowerCase() !== "unknown"),
  );
  const uniqueCities = new Set(
    confirmed.map((r) => r.city.trim()).filter((c) => c && c.toLowerCase() !== "unknown"),
  );

  const tableRows = confirmed
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.summary.localeCompare(b.summary))
    .map(
      (r) =>
        `| ${r.date} | ${r.summary.replace(/\|/g, "/")} | ${r.city || "—"} | ${r.county || "—"} | Confirmed |`,
    )
    .join("\n");

  const section = `${SECTION_START}

Source worksheet: local Evidence Workbench → \`data/campaign-media/calendar-presence.json\` (edit at \`/admin/evidence-workbench\`).

| Field | Value |
| --- | --- |
| Calendar rows in store | ${store.rows.length} |
| **Calendar rows marked Confirmed** | **${confirmed.length}** |
| Unique confirmed counties | ${uniqueCounties.size} |
| Unique confirmed cities | ${uniqueCities.size} |
| Public county/city totals on \`/from-the-road\` | Held until Confirmed counts are intentionally published |

${
  confirmed.length === 0
    ? "**Do not** fill Event column or public counts from titles alone. Mark rows **Confirmed** in the workbench with City/County, then re-run Export."
    : `### Confirmed calendar rows (exported ${new Date().toISOString().slice(0, 10)})

| Date | Summary | City | County | Status |
| --- | --- | --- | --- | --- |
${tableRows}`
}

`;

  let md = readFileSync(abs, "utf8");
  const startIdx = md.indexOf(SECTION_START);
  if (startIdx === -1) {
    // Insert before Public-site section
    const pubIdx = md.indexOf("## Public-site");
    if (pubIdx === -1) {
      md = `${md.trimEnd()}\n\n${section}\n`;
    } else {
      md = `${md.slice(0, pubIdx)}${section}\n${md.slice(pubIdx)}`;
    }
  } else {
    const afterStart = md.slice(startIdx);
    const endRel = afterStart.indexOf(`\n${SECTION_END}`);
    if (endRel === -1) {
      md = `${md.slice(0, startIdx)}${section}`;
    } else {
      md = `${md.slice(0, startIdx)}${section}\n${md.slice(startIdx + endRel + 1)}`;
    }
  }

  writeFileSync(abs, md, "utf8");
  return { ok: true, confirmedCount: confirmed.length };
}
