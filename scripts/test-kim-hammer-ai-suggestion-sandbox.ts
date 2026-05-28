import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import {
  filterKimHammerSuggestions,
  generateKimHammerLiveSuggestionCandidates,
  KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL,
  loadKimHammerAiSuggestionSandbox,
  summarizeKimHammerSuggestionSandbox,
} from "@/lib/opposition/kimHammerSuggestionSandbox";
import {
  KIM_HAMMER_SUGGESTION_AUDIT_LOG_REL,
  updateKimHammerSuggestionDisposition,
} from "@/lib/opposition/kimHammerSuggestionWorkflow";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const PROFILE_REL = "data/opposition/kim-hammer-profile";

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerSuggestionSandbox.ts",
  "src/lib/opposition/kimHammerSuggestionWorkflow.ts",
  "src/lib/opposition/types/kimHammerAiSuggestion.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerAiSuggestionSandboxBrowser.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/ai-suggestion-sandbox/page.tsx",
  KIM_HAMMER_AI_SUGGESTION_SANDBOX_REL,
];

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kh-ai-sandbox-"));
  const profileDir = path.join(tempDir, PROFILE_REL);
  mkdirSync(profileDir, { recursive: true });

  const seedFiles = [
    "kim-hammer-public-debate-evidence-board.json",
    "kim-hammer-kh4-claim-graph.json",
    "kim-hammer-intelligence-gaps.json",
    "kim-hammer-kh4-risk-register.json",
    "kim-hammer-kh4-publication-safety.json",
    "kim-hammer-citation-locker.json",
    "kim-hammer-ai-suggestion-sandbox.json",
    "kim-hammer-suggestion-audit-log.json",
  ];

  for (const fileName of seedFiles) {
    cpSync(path.join(process.cwd(), PROFILE_REL, fileName), path.join(profileDir, fileName));
  }

  return tempDir;
}

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing V3-D artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(registrySource.includes('"ai-suggestion-sandbox"'), "Briefing registry must include ai-suggestion-sandbox.");

  const sandbox = loadKimHammerAiSuggestionSandbox();
  assert(sandbox.suggestions.length >= 8, "Production sandbox must seed corpus-derived suggestions.");
  assert(
    sandbox.suggestions.every((row) => row.publicationSafety === "NON_PUBLISHABLE"),
    "All suggestions must be non-publishable.",
  );
  assert(
    sandbox.suggestions.every((row) => row.humanReviewRequired === true),
    "All suggestions must require human review.",
  );

  const summary = summarizeKimHammerSuggestionSandbox();
  assert(summary.pendingCount === sandbox.suggestions.length, "Seeded sandbox should start all PENDING.");

  const liveCandidates = generateKimHammerLiveSuggestionCandidates();
  assert(liveCandidates.length >= 5, "Live suggestion engine must derive candidates from corpus.");

  const narrativeSuggestion = sandbox.suggestions.find((row) => row.id === "sugg-narrative-kh0b-integrity-blocked");
  assert(narrativeSuggestion, "Must include narrative weakness suggestion for KH-0B foundation.");
  assert(narrativeSuggestion.suggestedRoute === "CITATION_LOCKER", "Narrative weakness must route to citation locker.");

  const filtered = filterKimHammerSuggestions(sandbox, {
    suggestionType: "RETRIEVAL_PRIORITY",
    status: "PENDING",
  });
  assert(filtered.length >= 2, "Must include multiple retrieval priority suggestions.");

  const tempRepo = setupTempRepo();

  try {
    const acceptResult = updateKimHammerSuggestionDisposition(
      {
        suggestionId: "sugg-narrative-kh0b-integrity-blocked",
        operator: "Sandbox test",
        changedByRoute: "test-kim-hammer-ai-suggestion-sandbox",
        nextStatus: "ACCEPTED",
        operatorNotes: "Route to citation revalidation — no auto-publish.",
      },
      tempRepo,
    );
    assert(acceptResult.ok, `Accept failed: ${!acceptResult.ok ? acceptResult.error : ""}`);
    assert(acceptResult.pendingCount === sandbox.suggestions.length - 1, "Pending count must decrement.");

    const dismissResult = updateKimHammerSuggestionDisposition(
      {
        suggestionId: "sugg-debate-packet-export-ready",
        operator: "Sandbox test",
        changedByRoute: "test-kim-hammer-ai-suggestion-sandbox",
        nextStatus: "DISMISSED",
        operatorNotes: "Already verified manually.",
      },
      tempRepo,
    );
    assert(dismissResult.ok, `Dismiss failed: ${!dismissResult.ok ? dismissResult.error : ""}`);

    const timeline = loadKimHammerUnifiedAuditTimeline(tempRepo);
    assert(timeline.aiSuggestionCount >= 2, "Suggestion dispositions must appear in unified audit timeline.");
    assert(
      timeline.entries.some((entry) => entry.kind === "AI_SUGGESTION"),
      "Unified timeline must include AI_SUGGESTION entries.",
    );

    assert(
      fs.existsSync(path.join(tempRepo, KIM_HAMMER_SUGGESTION_AUDIT_LOG_REL)),
      "Suggestion audit log must exist after mutations.",
    );

    const backupDir = path.join(tempRepo, PROFILE_REL, "backups");
    assert(fs.existsSync(backupDir), "Suggestion mutations must create backups.");

    const tempSandbox = loadKimHammerAiSuggestionSandbox(tempRepo);
    const accepted = tempSandbox.suggestions.find((row) => row.id === "sugg-narrative-kh0b-integrity-blocked");
    assert(accepted?.status === "ACCEPTED", "Accepted suggestion must persist in sandbox JSON.");
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  console.log("Kim Hammer AI suggestion sandbox checks passed.");
  console.log(
    JSON.stringify(
      {
        productionSuggestionCount: sandbox.suggestions.length,
        pendingSuggestions: summary.pendingCount,
        liveCandidateCount: liveCandidates.length,
        route: "/admin/intelligence/kim-hammer/ai-suggestion-sandbox",
      },
      null,
      2,
    ),
  );
}

main();
