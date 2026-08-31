import { EVIDENCE_CATEGORIES } from "./constants";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export type EvidenceLine = {
  label: string;
  text: string;
  at?: string;
};

export type EvidenceBucket = {
  id: string;
  label: string;
  items: EvidenceLine[];
};

function formatValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((v) => formatValue(v)).filter(Boolean).join("; ");
  if (isRecord(value)) {
    const label = typeof value.label === "string" ? value.label : "";
    const reasoning = typeof value.reasoning === "string" ? value.reasoning : "";
    const explanation = typeof value.explanation === "string" ? value.explanation : "";
    const answer = typeof value.answer === "string" ? value.answer : "";
    const choice = typeof value.choiceLabel === "string" ? value.choiceLabel : "";
    const parts = [label || choice, answer, reasoning || explanation].filter((p) => p && p.trim());
    if (parts.length) return parts.join(" — ");
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return "";
}

export function extractTalentFoundryBlob(metadata: unknown, structuredData: unknown): Record<string, unknown> {
  const fromMeta = isRecord(metadata) && isRecord(metadata.talentFoundry) ? metadata.talentFoundry : null;
  const fromSub =
    isRecord(structuredData) && isRecord(structuredData.talentFoundry) ? structuredData.talentFoundry : null;
  return { ...(fromMeta ?? {}), ...(fromSub ?? {}) };
}

export function organizeEvidence(blob: Record<string, unknown>): EvidenceBucket[] {
  const evidence = Array.isArray(blob.evidence) ? blob.evidence : [];
  const buckets: EvidenceBucket[] = EVIDENCE_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    items: [],
  }));
  const byId = new Map<string, EvidenceBucket>(buckets.map((b) => [b.id, b]));

  for (const raw of evidence) {
    if (!isRecord(raw)) continue;
    const text = formatValue(raw.value);
    if (!text) continue;
    const label = typeof raw.label === "string" && raw.label.trim() ? raw.label.trim() : "Evidence";
    const at = typeof raw.at === "string" ? raw.at : undefined;
    const dims = Array.isArray(raw.dimensions) ? raw.dimensions.filter((d): d is string => typeof d === "string") : [];
    const line = { label, text: text.slice(0, 2000), at };
    let placed = false;
    for (const dim of dims) {
      const bucket = byId.get(dim);
      if (bucket) {
        bucket.items.push(line);
        placed = true;
      }
    }
    if (!placed && dims.length === 0) {
      const stateId = typeof raw.stateId === "string" ? raw.stateId : "";
      if (stateId === "change_prompt" || stateId === "scenario_revision") {
        byId.get("written_communication")?.items.push(line);
      }
    }
  }

  const flags = isRecord(blob.flags) ? blob.flags : {};
  const doors = Array.isArray(flags.optionalDoorsCompleted) ? flags.optionalDoorsCompleted.length : 0;
  const follow = byId.get("follow_through");
  if (follow) {
    if (flags.requiredScenarioComplete === true) {
      follow.items.push({ label: "Required journey", text: "Required scenario complete" });
    }
    if (doors > 0) {
      follow.items.push({ label: "Optional doors", text: `${doors} of 4 optional doors completed` });
    }
    if (flags.keyOne === true) {
      follow.items.push({ label: "Key One", text: "Key One acquired" });
    }
  }

  const routing = isRecord(blob.routing) ? blob.routing : {};
  const avail = byId.get("availability");
  if (avail) {
    const startWhen = typeof blob.startWhen === "string" ? blob.startWhen.trim() : "";
    if (startWhen) avail.items.push({ label: "Start availability", text: startWhen });
    if (typeof routing.weekly === "string" && routing.weekly.trim()) {
      avail.items.push({ label: "Weekly hours (self-reported)", text: routing.weekly });
    }
    if (Array.isArray(routing.times) && routing.times.length) {
      avail.items.push({ label: "Times available", text: routing.times.map(String).join(", ") });
    }
    if (typeof routing.littleRock === "string" && routing.littleRock.trim()) {
      avail.items.push({ label: "Little Rock / HQ", text: routing.littleRock });
    }
    if (typeof routing.remote === "string" && routing.remote.trim()) {
      avail.items.push({ label: "Remote", text: routing.remote });
    }
    if (typeof routing.driving === "string" && routing.driving.trim()) {
      avail.items.push({ label: "Driving", text: routing.driving });
    }
    if (typeof routing.travel === "string" && routing.travel.trim()) {
      avail.items.push({ label: "Travel", text: routing.travel });
    }
  }

  return buckets;
}
