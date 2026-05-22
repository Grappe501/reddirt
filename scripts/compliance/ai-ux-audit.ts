import { buildComplianceUxAudit } from "../../src/lib/compliance/ai/expert/build-ux-audit";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const audit = buildComplianceUxAudit();
  const outPath = path.join(process.cwd(), "data", "compliance", "ai", "ux-audit.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(audit, null, 2), "utf8");
  console.log(
    JSON.stringify(
      { status: "ok", path: outPath, routes: audit.routes.length, highPriority: audit.routes.filter((r) => r.priority === "high").length },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
