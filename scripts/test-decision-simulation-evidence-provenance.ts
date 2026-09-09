import { readFileSync } from "node:fs";
import { buildDecisionSimulationUserPrompt } from "../src/lib/agents/decision-simulation/prompt";
import {
  attachPriorCorrespondence,
  formatEvidenceProvenancePromptLine,
  formatPriorCorrespondencePromptBlock,
  getEvidenceProvenanceSnapshot,
} from "../src/lib/agents/decision-simulation/evidence-provenance";
import { buildWritingIntelligencePromptPacket } from "../src/lib/agents/decision-simulation/writing-intelligence/prompt-packet";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

console.log("Decision Simulator evidence provenance");

const jones = getEvidenceProvenanceSnapshot("chris-jones-ar02");
const hill = getEvidenceProvenanceSnapshot("french-hill-ar02");
assert(jones && jones.claimCount >= 10, "Jones catalog claims are provenance-tagged");
assert(hill && hill.claimCount >= 10, "Hill catalog claims are provenance-tagged");
assert(
  jones?.claims.every((item) => item.claim.length <= 220 && Boolean(item.provenance) && Boolean(item.sourceState)),
  "Jones claims stay short and sourced",
);
assert(
  jones?.claims.some((item) => item.provenance === "FIRST_PARTY") &&
    jones.claims.some((item) => item.provenance === "DISCOVERY_ONLY"),
  "Jones keeps first-party pages separate from discovery media",
);
assert(hill?.claims.some((item) => item.id === "claim-hill-votes-missing" && item.provenance === "MISSING"), "Hill vote corpus stays missing");
assert(
  !hill?.claims.some((item) => /when French Hill voted to cut Medicaid/i.test(item.claim)),
  "Jones Hill-vote characterization is not a Hill claim",
);
assert(!getEvidenceProvenanceSnapshot("generic"), "generic actor has no invented evidence archive");

const attached = attachPriorCorrespondence({
  paste: ["From: operator@example.test", "Subject: Housing follow-up", "", "Last month we asked about rural hospitals only."].join("\n"),
  channel: "EMAIL",
  title: "April housing note",
});
assert(attached && attached.provenance === "OPERATOR_ATTACHED" && attached.connectorsEnabled === false, "prior paste is operator-attached");
assert(Boolean(attached && attached.bodyExcerpt.length <= 280 && attached.bodyExcerpt.includes("rural hospitals")), "prior excerpt stays short");
assert(!formatPriorCorrespondencePromptBlock([]), "empty attachment list does not invent letters");
assert(
  formatPriorCorrespondencePromptBlock([
    { channel: "EMAIL", bodyExcerpt: "Asked about rural hospitals only.", provenance: "OPERATOR_ATTACHED" },
  ]).includes("OPERATOR_ATTACHED"),
  "prompt block accepts opening-input attachments that omit the catalog version field",
);

const withAttach = getEvidenceProvenanceSnapshot("chris-jones-ar02", attached ? [attached] : []);
assert(withAttach?.attachedCount === 1 && withAttach.claims.some((item) => item.provenance === "OPERATOR_ATTACHED"), "attached letter becomes a claim");

const line = formatEvidenceProvenancePromptLine("french-hill-ar02");
assert(line.includes("MISSING=") && line.includes("Evidence refs"), "Hill provenance line reports missing and keeps evidence refs");

const packet = buildWritingIntelligencePromptPacket("chris-jones-ar02");
assert(
  Boolean(packet && packet.lines.length < 12 && packet.lines.some((item) => item.includes("Provenance"))),
  "writing packet stays compact and includes provenance",
);

const prompt = buildDecisionSimulationUserPrompt({
  message: "Asking about housing.",
  channel: "EMAIL",
  priorCorrespondence: attached ? [attached] : [],
});
assert(prompt.includes("OPERATOR_ATTACHED") && prompt.includes("Do not send"), "simulation prompt carries attached letters without a send path");

const ui = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
assert(ui.includes("Attach prior correspondence as evidence"), "mission lab can attach prior letters");
assert(ui.includes("Evidence provenance") === false, "opening panel does not dump the full claim catalog");

const personality = readFileSync("src/components/admin/decision-simulator/PersonalityIntelligence.tsx", "utf8");
assert(personality.includes("Evidence provenance"), "dossier surfaces provenance-tagged claims");

const drawer = readFileSync("src/components/admin/decision-simulator/DecisionIntelligence.tsx", "utf8");
assert(drawer.includes("getEvidenceProvenanceSnapshot"), "dashboard evidence drawer reads live provenance");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-EVIDENCE-PROVENANCE-1.0"), "Phase 9 provenance slice is named on the canonical roadmap");
assert(roadmap.includes("V2-33"), "stale-evidence decay and prior-sim retrieval stay V2");

console.log("OK — evidence provenance gates passed");
