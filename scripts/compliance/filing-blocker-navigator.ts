import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildFilingBlockerNavigator,
  renderFilingBlockerNavigatorMarkdown,
} from "../../src/lib/compliance/audit/build-filing-blocker-navigator";

async function main() {
  const nav = await buildFilingBlockerNavigator();
  const aiDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(aiDir, { recursive: true });
  await writeFile(path.join(aiDir, "filing-blocker-navigator.json"), JSON.stringify(nav, null, 2), "utf8");
  await writeFile(
    path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_FILING_BLOCKER_NAVIGATOR.md"),
    renderFilingBlockerNavigatorMarkdown(nav),
    "utf8",
  );
  console.log(JSON.stringify({ status: "ok", blockers: nav.blockers.length, filingStatus: nav.filingStatus }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
