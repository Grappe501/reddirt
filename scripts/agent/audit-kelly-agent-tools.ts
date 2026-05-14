import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/agent/kelly-agent-tools-audit.json");
const TOOL_DIR = path.join(ROOT, "src/lib/kelly-agent/tools");
const RUNNER = path.join(ROOT, "src/lib/kelly-agent/kelly-agent-tools.ts");
const CAPABILITIES = path.join(ROOT, "data/agent/kelly-agent-capabilities.json");

type Capability = { id: string; name: string; description: string; outputUsedBy?: string[]; humanOverrideRequired?: boolean };

async function listTs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listTs(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function exportsFrom(raw: string): string[] {
  return [...raw.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]!).sort();
}

async function main() {
  const generatedAt = new Date().toISOString();
  const [files, runnerRaw, capsRaw] = await Promise.all([
    listTs(TOOL_DIR),
    readFile(RUNNER, "utf8").catch(() => ""),
    readFile(CAPABILITIES, "utf8").catch(() => "[]"),
  ]);
  const caps = JSON.parse(capsRaw) as Capability[];
  const capBlob = JSON.stringify(caps).toLowerCase();
  const tools = await Promise.all(files.map(async (file) => {
    const raw = await readFile(file, "utf8");
    const rel = path.relative(ROOT, file).replaceAll("\\", "/");
    const exportNames = exportsFrom(raw);
    const base = path.basename(file, ".ts").replace(/-tool$/, "");
    return {
      toolName: base,
      filePath: rel,
      exists: true,
      exportNames,
      wiredIntoRunKellyAgentTools: runnerRaw.includes(path.basename(file, ".ts")) || exportNames.some((name) => runnerRaw.includes(name)),
      listedInCapabilityLedger: capBlob.includes(base.replace(/-/g, "_")) || capBlob.includes(base.replace(/-/g, " ")),
      outputFileExists: outputExistsFor(base),
      humanOverrideDocumented: /human override|humanApprovalRequired|humanOverrideRequired/i.test(raw) || capBlob.includes(base.replace(/-/g, "_")),
    };
  }));
  const report = {
    generatedAt,
    toolCount: tools.length,
    wiredCount: tools.filter((t) => t.wiredIntoRunKellyAgentTools).length,
    ledgerCount: tools.filter((t) => t.listedInCapabilityLedger).length,
    tools,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

function outputExistsFor(base: string): boolean {
  const candidates = [
    `data/agent/${base}-latest.json`,
    `data/agent/${base}-report-latest.json`,
    `data/calendar-command-center/${base}.staged.json`,
  ];
  return candidates.some((rel) => existsSync(path.join(ROOT, rel)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
