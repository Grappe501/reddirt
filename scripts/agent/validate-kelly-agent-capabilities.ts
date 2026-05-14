import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const IN = path.join(ROOT, "data/agent/kelly-agent-capabilities.json");
const OUT = path.join(ROOT, "data/agent/kelly-agent-capabilities-validation.json");

type Capability = {
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  inputSources?: string[];
  outputUsedBy?: string[];
  humanOverrideRequired?: boolean;
  status?: "live" | "db_backed" | "file_staged" | "blocked" | "missing";
};

const SECRET_RE = /(sk-[a-z0-9]{20,}|eyJ[a-z0-9_-]{20,}|refresh_token["'\s:=]+[a-z0-9._-]{12,}|client_secret["'\s:=]+[a-z0-9._-]{12,}|password["'\s:=]+[^,\s"]{8,})/i;
const COMMAND_RE = /^(npm|npx|pnpm|yarn|tsx|node|bash|powershell|git)\s+/i;
const NO_LIVE_SEND_RE = /(email|sms|send|publish|press release|volunteer callout)/i;

function sourceLooksMissing(source: string): boolean {
  if (!/[/.]/.test(source) || source.includes("*")) return false;
  if (/^(AgentContextPack\.|CampaignEvent|CalendarSource|County|Prisma|public\.|data\/agent\/\*)/.test(source)) return false;
  return !require("node:fs").existsSync(path.join(ROOT, source));
}

async function main() {
  const generatedAt = new Date().toISOString();
  const errors: string[] = [];
  const warnings: string[] = [];
  let capabilities: Capability[] = [];

  try {
    const parsed = JSON.parse(await readFile(IN, "utf8")) as unknown;
    capabilities = Array.isArray(parsed) ? parsed as Capability[] : [];
  } catch (err) {
    errors.push(`invalid JSON: ${err instanceof Error ? err.message : "unknown parse error"}`);
  }

  const ids = new Map<string, number>();
  for (const [idx, cap] of capabilities.entries()) {
    const label = cap.id ?? `capability[${idx}]`;
    if (!cap.id) errors.push(`${label}: missing id`);
    if (!cap.name) errors.push(`${label}: missing name`);
    if (!cap.category) errors.push(`${label}: missing category`);
    if (!cap.description?.trim()) errors.push(`${label}: empty description`);
    if (typeof cap.humanOverrideRequired !== "boolean") errors.push(`${label}: missing humanOverrideRequired`);
    if (!Array.isArray(cap.inputSources)) errors.push(`${label}: missing inputSources`);
    if (!Array.isArray(cap.outputUsedBy)) errors.push(`${label}: missing outputUsedBy`);
    if (cap.id) ids.set(cap.id, (ids.get(cap.id) ?? 0) + 1);

    const blob = JSON.stringify(cap);
    if (SECRET_RE.test(blob)) errors.push(`${label}: secret-looking string detected`);
    for (const source of cap.inputSources ?? []) {
      if (COMMAND_RE.test(source)) warnings.push(`${label}: command listed in inputSources: ${source}`);
      if (sourceLooksMissing(source)) warnings.push(`${label}: input source may be missing: ${source}`);
    }
    if (cap.status === "live" && (cap.inputSources ?? []).some(sourceLooksMissing)) {
      warnings.push(`${label}: marked live but at least one file input appears missing`);
    }
    if (cap.status === "live" && NO_LIVE_SEND_RE.test(`${cap.id} ${cap.name} ${cap.description}`)) {
      warnings.push(`${label}: send/publish capability should not be marked live without explicit approval gates`);
    }
  }

  for (const [id, count] of ids) {
    if (count > 1) errors.push(`duplicate id: ${id} (${count})`);
  }

  const report = {
    generatedAt,
    ok: errors.length === 0,
    capabilityCount: capabilities.length,
    errors,
    warnings,
    capabilities: capabilities.map((c) => ({ id: c.id, name: c.name, status: c.status, humanOverrideRequired: c.humanOverrideRequired })),
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
