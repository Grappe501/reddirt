import fs from "node:fs";
import path from "node:path";
import {
  filterKimHammerNarrativeStates,
  KIM_HAMMER_NARRATIVE_REGISTRY_REL,
  loadKimHammerNarrativeStateIndex,
  resolveKimHammerNarrativeState,
} from "@/lib/opposition/kimHammerNarrativeState";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerNarrativeState.ts",
  "src/lib/opposition/types/kimHammerNarrativeState.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerNarrativeStateDashboard.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/narrative-state/page.tsx",
  KIM_HAMMER_NARRATIVE_REGISTRY_REL,
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-1 artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(registrySource.includes('"narrative-state"'), "Briefing registry must include narrative-state module.");

  const dashboardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(dashboardSource.includes("/narrative-state"), "Evidence Command must link to narrative state.");

  const index = loadKimHammerNarrativeStateIndex();
  assert(index.narrativeCount >= 8, "NSI-1 must track at least 8 curated narratives.");
  assert(index.bandCounts.BLOCKED >= 1, "At least one narrative must score BLOCKED from real corpus dependencies.");
  assert(index.bandCounts.STRONG >= 1, "At least one narrative must score STRONG from export-ready dependencies.");

  const foundation = resolveKimHammerNarrativeState("kh0b-2021-integrity-foundation");
  assert(foundation, "Integrity foundation narrative must resolve.");
  assert(
    foundation.readinessBand === "BLOCKED" || foundation.readinessBand === "WEAK",
    `Integrity foundation should be blocked/weak due to SB487 citation; got ${foundation.readinessBand}.`,
  );
  assert(
    foundation.blockers.some((row) => row.includes("cite-sb487") || row.includes("SB487") || row.includes("NEEDS_REVIEW")),
    "Integrity foundation blockers must reference citation review gap.",
  );
  assert(foundation.pendingSuggestionCount >= 1, "Integrity foundation should reflect pending AI suggestions.");

  const sb487 = resolveKimHammerNarrativeState("SB487");
  assert(sb487, "SB487 bill narrative must resolve.");
  assert(sb487.readinessBand === "BLOCKED", "SB487 narrative must be BLOCKED while citation NEEDS_REVIEW.");

  const debateQuestions = resolveKimHammerNarrativeState("debate-frame-debate-questions");
  assert(debateQuestions, "Debate questions frame must resolve.");
  assert(debateQuestions.readinessBand === "STRONG", "Debate questions frame should be STRONG with export-ready claim.");

  const management = resolveKimHammerNarrativeState("debate-frame-management-readiness");
  assert(management, "Management readiness frame must resolve.");
  assert(
    management.readinessBand === "WEAK" || management.readinessBand === "BLOCKED",
    "Management readiness frame should be weak/blocked due to partial citation and NEEDS_REVIEW.",
  );
  assert(management.linkedTaskIds.includes("kh3b-management-readiness-evidence"), "Management frame must link retrieval task.");

  const filtered = filterKimHammerNarrativeStates(index, { band: "BLOCKED" });
  assert(filtered.length >= 2, "Blocked filter must return multiple narratives.");

  for (const row of index.narratives) {
    assert(row.readinessScore >= 0 && row.readinessScore <= 1, "Readiness score must be normalized 0-1.");
    assert(row.signal.length > 0, "Every narrative must expose a human-readable signal.");
  }

  console.log("Kim Hammer narrative state intelligence checks passed.");
  console.log(
    JSON.stringify(
      {
        narrativeCount: index.narrativeCount,
        bandCounts: index.bandCounts,
        integrityFoundationSignal: foundation.signal,
        debateQuestionsBand: debateQuestions.readinessBand,
        route: "/admin/intelligence/kim-hammer/narrative-state",
      },
      null,
      2,
    ),
  );
}

main();
