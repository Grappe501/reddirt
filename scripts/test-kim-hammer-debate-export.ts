import fs from "node:fs";
import path from "node:path";
import {
  KIM_HAMMER_EXPORT_FILTER,
  loadKimHammerEvidenceIndex,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  buildKimHammerDebateExportMarkdown,
  buildKimHammerDebateExportPayload,
} from "@/lib/opposition/kimHammerDebateExport";
import {
  canExportClaim,
  getSafetyBlockers,
  passesReviewExportGate,
} from "@/lib/opposition/kimHammerPublicationSafety";
import { KIM_HAMMER_EXPORT_APPROVED_REVIEW_STATUSES } from "@/lib/opposition/types/kimHammerEvidence";
import type { KimHammerClaim } from "@/lib/opposition/types/kimHammerEvidence";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const routePath = "src/app/api/opposition/kim-hammer/debate-export/route.ts";
  assert(fs.existsSync(path.join(process.cwd(), routePath)), `Missing debate export route: ${routePath}`);

  const safetyModulePath = "src/lib/opposition/kimHammerPublicationSafety.ts";
  assert(
    fs.existsSync(path.join(process.cwd(), safetyModulePath)),
    `Missing publication safety module: ${safetyModulePath}`,
  );

  const routeSource = fs.readFileSync(path.join(process.cwd(), routePath), "utf8");
  assert(
    routeSource.includes("canExportClaim"),
    "Debate export route must use centralized canExportClaim gate.",
  );
  assert(
    routeSource.includes("getReviewStatusLabel"),
    "Debate export route must include review status in export payload.",
  );
  assert(
    routeSource.includes("@/lib/opposition/kimHammerPublicationSafety"),
    "Debate export route must import publication safety module.",
  );

  const exportPagePath = "src/app/admin/(board)/intelligence/kim-hammer/debate-packet-export/page.tsx";
  const exportActionsPath =
    "src/app/admin/(board)/intelligence/kim-hammer/debate-packet-export/DebatePacketExportActions.tsx";
  assert(fs.existsSync(path.join(process.cwd(), exportPagePath)), `Missing debate packet export page: ${exportPagePath}`);
  assert(
    fs.existsSync(path.join(process.cwd(), exportActionsPath)),
    `Missing debate packet export actions: ${exportActionsPath}`,
  );

  const actionsSource = fs.readFileSync(path.join(process.cwd(), exportActionsPath), "utf8");
  assert(
    actionsSource.includes("/api/opposition/kim-hammer/debate-export?format=json"),
    "Export actions must link to JSON debate export API.",
  );
  assert(
    actionsSource.includes("/api/opposition/kim-hammer/debate-export?format=markdown"),
    "Export actions must link to Markdown debate export API.",
  );

  const index = loadKimHammerEvidenceIndex();
  const payload = buildKimHammerDebateExportPayload();

  assert(
    index.claims.filter(canExportClaim).length === 2,
    `Publication safety gate must allow exactly 2 export-ready claims; got ${index.claims.filter(canExportClaim).length}.`,
  );

  const blockedClaim = index.claims.find((claim) => claim.id === "pdeb-004-civic-affiliation-claims");
  assert(blockedClaim, "Blocked civic affiliation claim must exist in index.");
  assert(!canExportClaim(blockedClaim!), "Blocked claim must fail canExportClaim gate.");
  const blockedSafety = getSafetyBlockers(blockedClaim!, index.publicationSafety.rules);
  assert(
    blockedSafety.includes("rule-tier-4-block") && blockedSafety.includes("rule-uncited-block"),
    "Blocked claim must return consistent tier and uncited safety blockers.",
  );

  const cautionClaim = index.claims.find((claim) => claim.id === "pdeb-002-management-readiness");
  assert(cautionClaim, "Caution-tier claim must exist in index.");
  assert(!canExportClaim(cautionClaim!), "Tier 2 / medium-risk claim must fail export gate.");
  assert(
    getSafetyBlockers(cautionClaim!, index.publicationSafety.rules).some((id) => id.startsWith("gate-")),
    "Non-exportable caution claim must include export gate blockers.",
  );

  assert(payload.generatedAt.length > 0, "Export payload must include generatedAt.");
  assert(payload.opponent === "Kim Hammer", "Export payload opponent must be Kim Hammer.");
  assert(payload.exportCount === payload.claims.length, "exportCount must match claims array length.");
  assert(
    payload.exportCount === index.metrics.exportReadyClaims,
    "Export count must match export-ready claims from evidence index.",
  );
  assert(payload.exportCount === 2, `Expected 2 export-ready claims at baseline; got ${payload.exportCount}.`);

  const blockedIds = new Set(index.blockedClaims.map((claim) => claim.id));
  assert(
    payload.claims.every((claim) => !blockedIds.has(claim.id)),
    "Blocked claims must never appear in debate export payload.",
  );

  assert(
    payload.claims.every(
      (claim) =>
        claim.externalUseStatus === KIM_HAMMER_EXPORT_FILTER.externalUseStatus &&
        claim.publicationTier === KIM_HAMMER_EXPORT_FILTER.confidenceTier &&
        claim.legalRisk === KIM_HAMMER_EXPORT_FILTER.legalRisk,
    ),
    "Every exported claim must pass KH-4 publication filter fields.",
  );

  assert(
    payload.claims.every((claim) => claim.safeWording.length > 0 && claim.title.length > 0),
    "Exported claims must include title and safe wording.",
  );

  assert(
    payload.claims.every((claim) => claim.citationSummary.length > 0),
    "Exported claims must include citation summary.",
  );

  assert(
    payload.claims.every((claim) => typeof claim.sourceUrl === "string" && claim.sourceUrl.startsWith("http")),
    "Export-ready claims must include at least one public HTTP source URL.",
  );

  assert(
    payload.claims.every((claim) =>
      KIM_HAMMER_EXPORT_APPROVED_REVIEW_STATUSES.includes(
        claim.reviewStatus as (typeof KIM_HAMMER_EXPORT_APPROVED_REVIEW_STATUSES)[number],
      ),
    ),
    "Exported claims must carry export-approved review statuses.",
  );

  const legacyClaim: KimHammerClaim = {
    id: "legacy-api-fallback",
    text: "Legacy export fallback test claim.",
    externalUseStatus: "READY_WITH_CITATION",
    citationStatus: "CITED",
    confidenceTier: "TIER_1_PUBLIC_DEPLOYABLE",
    legalRisk: "LOW",
  };
  assert(passesReviewExportGate(legacyClaim), "Debate export API gate must preserve legacy review fallback.");

  const markdown = buildKimHammerDebateExportMarkdown(payload);
  assert(markdown.includes("# Kim Hammer Debate Packet Export"), "Markdown must include packet title.");
  assert(markdown.includes(`Export-ready claims: ${payload.exportCount}`), "Markdown must include export count.");
  assert(markdown.includes("## 1."), "Markdown must include numbered claim cards.");
  assert(markdown.includes("**Safe wording:**"), "Markdown must include safe wording labels.");
  assert(markdown.includes("**Citation summary:**"), "Markdown must include citation summary labels.");
  assert(markdown.includes("**Publication tier:**"), "Markdown must include publication tier labels.");
  assert(markdown.includes("**Legal risk:**"), "Markdown must include legal risk labels.");
  assert(markdown.includes("**Review status:**"), "Markdown must include review status labels.");

  console.log("Kim Hammer debate export API checks passed.");
  console.log(
    JSON.stringify(
      {
        opponent: payload.opponent,
        exportCount: payload.exportCount,
        claimIds: payload.claims.map((claim) => claim.id),
      },
      null,
      2,
    ),
  );
}

main();
