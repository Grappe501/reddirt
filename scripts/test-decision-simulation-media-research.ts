import { readFileSync } from "node:fs";
import {
  MEDIA_CLIPS,
  formatMediaResearchPromptLine,
  getMediaClips,
  getMediaResearchSnapshot,
} from "../src/lib/agents/decision-simulation/media-research";
import { buildWritingIntelligencePromptPacket } from "../src/lib/agents/decision-simulation/writing-intelligence/prompt-packet";
import { chrisJonesPersonality, frenchHillPersonality } from "../src/lib/agents/decision-simulation/personality-catalog";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

console.log("Decision Simulator historic media research");

const jones = getMediaClips("chris-jones-ar02");
const hill = getMediaClips("french-hill-ar02");
assert(jones.length >= 12, "Jones has a first-pass media set");
assert(hill.length >= 10, "Hill has a first-pass media set");
assert(MEDIA_CLIPS.every((item) => item.provenance === "DISCOVERY_ONLY"), "media stays discovery-only, not first-party writing");
assert(MEDIA_CLIPS.every((item) => item.quote.length <= 220), "quotes stay short excerpts");
assert(MEDIA_CLIPS.every((item) => item.url.startsWith("https://") && /^\d{4}-\d{2}-\d{2}$/.test(item.publishedAt)), "every clip has a URL and date");
assert(
  new Set(MEDIA_CLIPS.map((item) => item.id)).size === MEDIA_CLIPS.length,
  "clip ids are unique",
);

const hillText = hill.map((item) => `${item.quote} ${item.notes ?? ""}`).join("\n");
const jonesHillVote = jones.find((item) => item.id === "jones-amp-2026-07-16-hospitals");
assert(Boolean(jonesHillVote?.notes?.includes("Not ingested as a Hill fact")), "Jones Hill-vote claim stays labeled as Jones speech");
assert(!hillText.includes("when French Hill voted to cut Medicaid"), "Jones Medicaid-contrast quote is not on the Hill card");
assert(!JSON.stringify(MEDIA_CLIPS).includes("48% to 44%"), "poll graphics were not ingested");
assert(!JSON.stringify(MEDIA_CLIPS).includes("Buttigieg said"), "endorser quotes are not treated as Jones voice");

assert(formatMediaResearchPromptLine("chris-jones-ar02").includes("DISCOVERY_ONLY"), "Jones prompt line flags discovery media");
assert(formatMediaResearchPromptLine("french-hill-ar02").includes("HOUSING_SUPPLY"), "Hill prompt line carries housing-supply media");
assert(!formatMediaResearchPromptLine("generic"), "generic actor has no invented media archive");

const packet = buildWritingIntelligencePromptPacket("chris-jones-ar02");
assert(Boolean(packet && packet.lines.length < 12 && packet.lines.some((line) => line.includes("Media-backed stances"))), "writing packet stays compact and includes media");

assert(chrisJonesPersonality.version === "jones-ar02-research-1.2", "Jones catalog version records the media pass");
assert(frenchHillPersonality.version === "hill-ar02-research-1.2", "Hill catalog version records the media pass");
assert(chrisJonesPersonality.sources.some((item) => item.url.includes("katv.com")), "Jones catalog cites the KATV interview");
assert(frenchHillPersonality.sources.some((item) => item.url.includes("experience-matters-rep-french-hill")), "Hill catalog cites the AMP interview");

const snap = getMediaResearchSnapshot("chris-jones-ar02");
assert(Boolean(snap?.missing.some((item) => /Democrat-Gazette paywall|broadcast transcripts|Lexis/i.test(item))), "missing archives stay missing");

const ui = readFileSync("src/components/admin/decision-simulator/PersonalityIntelligence.tsx", "utf8");
assert(ui.includes("Historic media research"), "mission lab surfaces the media drawer");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-MEDIA-RESEARCH-1.0"), "Phase 9 media slice is named on the canonical roadmap");
assert(roadmap.includes("V2-32"), "full paid-archive / transcript ingest is filed as V2");

console.log("OK — media research gates passed");
