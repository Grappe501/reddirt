import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import {
  citationsForClaim,
  filterCitationCards,
  loadKimHammerCitationLocker,
  narrativeHealthSignals,
  summarizeKimHammerCitationLocker,
} from "@/lib/opposition/kimHammerCitationLocker";
import {
  createKimHammerCitationCard,
  KIM_HAMMER_CITATION_AUDIT_LOG_REL,
  linkKimHammerCitationToClaim,
  updateKimHammerCitationCard,
} from "@/lib/opposition/kimHammerCitationWorkflow";
import { KIM_HAMMER_CITATION_LOCKER_REL } from "@/lib/opposition/kimHammerCitationLocker";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const PROFILE_REL = "data/opposition/kim-hammer-profile";

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerCitationLocker.ts",
  "src/lib/opposition/kimHammerCitationWorkflow.ts",
  "src/lib/opposition/types/kimHammerCitationLocker.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCitationLockerBrowser.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/citation-locker/page.tsx",
  KIM_HAMMER_CITATION_LOCKER_REL,
];

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kh-citation-locker-"));
  const profileDir = path.join(tempDir, PROFILE_REL);
  mkdirSync(profileDir, { recursive: true });

  const seedFiles = [
    "kim-hammer-public-debate-evidence-board.json",
    "kim-hammer-kh4-claim-graph.json",
    "kim-hammer-intelligence-gaps.json",
    "kim-hammer-kh4-risk-register.json",
    "kim-hammer-kh4-publication-safety.json",
    "kim-hammer-citation-locker.json",
    "kim-hammer-citation-audit-log.json",
  ];

  for (const fileName of seedFiles) {
    cpSync(path.join(process.cwd(), PROFILE_REL, fileName), path.join(profileDir, fileName));
  }

  return tempDir;
}

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing V3-C artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(registrySource.includes('"citation-locker"'), "Briefing registry must include citation-locker module.");

  const dashboardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(dashboardSource.includes("/citation-locker"), "Evidence Command must link to citation locker.");

  const productionLocker = loadKimHammerCitationLocker();
  assert(productionLocker.citations.length >= 6, "Production locker must seed debate + legislative citations.");
  assert(productionLocker.claimLinks.length >= 5, "Production locker must seed claim links.");

  const summary = summarizeKimHammerCitationLocker();
  assert(summary.totalCitations === productionLocker.citations.length, "Summary count must match locker.");
  assert(summary.staleOrBlockedCount >= 1, "Seeded locker should include citations needing attention.");

  const pdeb001Citations = citationsForClaim("pdeb-001-election-integrity-record");
  assert(pdeb001Citations.length >= 2, "pdeb-001 must resolve multiple citation cards.");

  const foundationSignal = narrativeHealthSignals("kh0b-2021-integrity-foundation");
  assert(foundationSignal.linkedCitationCount >= 2, "Integrity foundation narrative must link citations.");
  assert(foundationSignal.signal.length > 0, "Narrative health signal must be non-empty.");

  const filtered = filterCitationCards(productionLocker, {
    reviewStatus: "VERIFIED",
    sourceHealth: "ALL",
  });
  assert(filtered.length >= 3, "Verified citation filter must return seeded cards.");

  const tempRepo = setupTempRepo();

  try {
    const createResult = createKimHammerCitationCard(
      {
        operator: "Citation test",
        changedByRoute: "test-kim-hammer-citation-locker",
        sourceUrl: "https://example.test/retrieval-output",
        summary: "Test produced evidence citation card.",
        originTaskId: "kh3b-test-task",
      },
      tempRepo,
    );
    assert(createResult.ok, `Create citation failed: ${!createResult.ok ? createResult.error : ""}`);

    const updateResult = updateKimHammerCitationCard(
      {
        citationId: createResult.citationId,
        operator: "Citation test",
        changedByRoute: "test-kim-hammer-citation-locker",
        reviewStatus: "VERIFIED",
        revalidate: true,
      },
      tempRepo,
    );
    assert(updateResult.ok, `Update citation failed: ${!updateResult.ok ? updateResult.error : ""}`);

    const linkResult = linkKimHammerCitationToClaim(
      {
        citationId: createResult.citationId,
        claimId: "pdeb-004-civic-affiliation-claims",
        operator: "Citation test",
        changedByRoute: "test-kim-hammer-citation-locker",
      },
      tempRepo,
    );
    assert(linkResult.ok, `Link citation failed: ${!linkResult.ok ? linkResult.error : ""}`);

    const tempLocker = loadKimHammerCitationLocker(tempRepo);
    const linked = citationsForClaim("pdeb-004-civic-affiliation-claims", tempRepo);
    assert(
      linked.some((row) => row.id === createResult.citationId),
      "Linked citation must resolve from claim ID.",
    );

    const timeline = loadKimHammerUnifiedAuditTimeline(tempRepo);
    assert(timeline.citationMutationCount >= 3, "Citation mutations must appear in unified audit timeline.");
    assert(
      timeline.entries.some((entry) => entry.kind === "CITATION_MUTATION"),
      "Unified timeline must include CITATION_MUTATION entries.",
    );

    assert(
      fs.existsSync(path.join(tempRepo, KIM_HAMMER_CITATION_AUDIT_LOG_REL)),
      "Citation audit log must exist after mutations.",
    );

    const backupDir = path.join(tempRepo, PROFILE_REL, "backups");
    assert(fs.existsSync(backupDir), "Citation mutations must create backups.");
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  console.log("Kim Hammer citation locker checks passed.");
  console.log(
    JSON.stringify(
      {
        productionCitationCount: productionLocker.citations.length,
        productionClaimLinks: productionLocker.claimLinks.length,
        needsAttention: summary.staleOrBlockedCount,
        narrativeSignalSample: foundationSignal.signal,
        route: "/admin/intelligence/kim-hammer/citation-locker",
      },
      null,
      2,
    ),
  );
}

main();
