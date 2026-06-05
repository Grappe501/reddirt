import "server-only";

import { allDiligenceCompletionSummary } from "@/lib/intelligence/v4/opponentDiligenceLogStore";
import { getPackoContrastGateStatus } from "@/lib/intelligence/v4/packoContrastGate";
import { KELLY_ATTACK_VECTORS } from "@/lib/intelligence/v4/kellyCandidateResearchDepth";
import { FIELD_BOOK_HUB_HREF } from "@/lib/intelligence/fieldBookRegistry";
import { OPPONENT_DILIGENCE_HUB_HREF } from "@/lib/intelligence/v4/opponentDiligenceRegistry";
import fs from "node:fs";
import path from "node:path";

export type PhaseAUpgradeItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  status: "complete" | "in_progress" | "open" | "blocked";
  statusLabel: string;
};

export type PhaseAUpgradePassReport = {
  passId: "phase-a-safety-diligence";
  title: "Step 1 — Phase A: Safety & diligence";
  summary: string;
  completionPct: number;
  items: PhaseAUpgradeItem[];
  fieldBookHref: string;
  diligenceHref: string;
};

export function computePhaseAUpgradePass(): PhaseAUpgradePassReport {
  const diligence = allDiligenceCompletionSummary();
  const kelly = diligence.find((d) => d.subjectId === "kelly-grappe");
  const hammer = diligence.find((d) => d.subjectId === "kim-hammer");
  const pakko = diligence.find((d) => d.subjectId === "michael-packo");
  const packoGate = getPackoContrastGateStatus();
  const kellyNeedsResearch = KELLY_ATTACK_VECTORS.filter((v) => v.verificationStatus === "NEEDS_RESEARCH").length;

  let claimsNeedsReview = 0;
  try {
    const ledger = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data/intelligence/claims/claim-ledger.json"), "utf8"),
    ) as { entries?: Array<{ classification?: string }> };
    claimsNeedsReview = (ledger.entries ?? []).filter((e) => e.classification === "NEEDS_REVIEW").length;
  } catch {
    /* optional */
  }

  const items: PhaseAUpgradeItem[] = [
    {
      id: "kelly-diligence",
      label: "Kelly five-search diligence log",
      description: "CourtConnect civil/criminal, UCC, business entity, property tax — counsel gate on hits.",
      href: "/admin/intelligence/diligence/kelly-grappe",
      status:
        (kelly?.pct ?? 0) >= 100 ? "complete" : (kelly?.pct ?? 0) > 0 ? "in_progress" : "open",
      statusLabel:
        (kelly?.pct ?? 0) >= 100
          ? "All searches logged"
          : `${kelly?.incomplete ?? 5} searches remaining`,
    },
    {
      id: "hammer-diligence",
      label: "Kim Hammer opponent diligence module",
      description: "Mirror five-search checklist + optional PACER — offensive diligence, counsel on hits.",
      href: "/admin/intelligence/diligence/kim-hammer",
      status:
        (hammer?.pct ?? 0) >= 100 ? "complete" : (hammer?.pct ?? 0) > 0 ? "in_progress" : "open",
      statusLabel:
        (hammer?.pct ?? 0) >= 100
          ? "All searches logged"
          : `${hammer?.incomplete ?? 5} searches remaining`,
    },
    {
      id: "pakko-diligence",
      label: "Michael Pakko diligence module",
      description: "Five-search protocol paired with PACKO finance and quote gates.",
      href: "/admin/intelligence/diligence/michael-packo",
      status:
        (pakko?.pct ?? 0) >= 100 ? "complete" : (pakko?.pct ?? 0) > 0 ? "in_progress" : "open",
      statusLabel:
        (pakko?.pct ?? 0) >= 100
          ? "All searches logged"
          : `${pakko?.incomplete ?? 5} searches remaining`,
    },
    {
      id: "kelly-attack-vectors",
      label: "Kelly attack vectors — close NEEDS_RESEARCH",
      description: "Complete court-records staff search vector before debate-stage denial lines.",
      href: "/admin/intelligence/kelly-debate-coaching",
      status: kellyNeedsResearch === 0 ? "complete" : "open",
      statusLabel: kellyNeedsResearch === 0 ? "Vectors verified" : `${kellyNeedsResearch} NEEDS_RESEARCH`,
    },
    {
      id: "claims-firewall",
      label: "Claims ledger + trap/SOS gates",
      description: "NEEDS_REVIEW rows tracked; CVSGF remittance research-question-only on stage.",
      href: "/admin/intelligence/claims",
      status: claimsNeedsReview === 0 ? "complete" : "in_progress",
      statusLabel:
        claimsNeedsReview === 0
          ? "No NEEDS_REVIEW rows"
          : `${claimsNeedsReview} NEEDS_REVIEW — staff verify`,
    },
    {
      id: "packo-contrast-gate",
      label: "PACKO-01/02 contrast gate",
      description: "Hard-block Pakko attack lines until finance + quote ledger at PARTIAL minimum.",
      href: "/admin/intelligence/opponents",
      status: packoGate.blocked ? "blocked" : "complete",
      statusLabel: packoGate.blocked
        ? `Locked — ${packoGate.openTaskIds.join(", ")} OPEN`
        : "Gate open — ledger partial",
    },
    {
      id: "field-book-phase-a",
      label: "The Field Book — Phase A canon",
      description: "Eight live encyclopedia articles with cross-links; B–D expand on future passes.",
      href: FIELD_BOOK_HUB_HREF,
      status: "complete",
      statusLabel: "Phase A articles live",
    },
  ];

  const completeCount = items.filter((i) => i.status === "complete").length;
  const inProgressCount = items.filter((i) => i.status === "in_progress").length;
  const completionPct = Math.round(((completeCount + inProgressCount * 0.5) / items.length) * 100);

  return {
    passId: "phase-a-safety-diligence",
    title: "Step 1 — Phase A: Safety & diligence",
    summary:
      "Court searches, opponent diligence parity, claims firewall, Pakko contrast gate, and Field Book Phase A canon.",
    completionPct,
    items,
    fieldBookHref: FIELD_BOOK_HUB_HREF,
    diligenceHref: OPPONENT_DILIGENCE_HUB_HREF,
  };
}
