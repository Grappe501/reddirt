import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildCompletionAccelerator } from "../../src/lib/compliance/ai/expert/build-completion-accelerator";

async function main() {
  const data = await buildCompletionAccelerator();
  const outDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "completion-accelerator.json");
  await writeFile(outPath, JSON.stringify(data, null, 2), "utf8");
  const briefPath = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_AI_COMPLETION_ACCELERATOR.md");
  const md = `# Compliance AI completion accelerator

Generated: ${data.generatedAt}  
Commit: ${data.commitBase}

## Top 10 actions

${data.top10Actions.map((a) => `${a.priority}. **${a.title}** (${a.owner}) — ${a.why}`).join("\n")}

## Before deploy

${data.beforeDeploy.map((l) => `- ${l}`).join("\n")}

Regenerate: \`npm run compliance:ai-completion-accelerator\`
`;
  await writeFile(briefPath, md, "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath, briefPath, actions: data.top10Actions.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
