import {
  appendClaimLedgerAuditEvent,
  findClaimById,
  upsertClaimLedgerEntry,
} from "./claimLedgerStore";
import type { ClaimLedgerEntry, ClaimVerificationStatus } from "./claimLedgerTypes";
import {
  canClaimBeApprovedForPublicAdaptation,
  canClaimBePromoted,
  exportControlAllowsPublicRelease,
} from "./citationDepthPolicy";

export { canClaimBePromoted };

function transitionClaim(
  claimId: string,
  nextStatus: ClaimVerificationStatus,
  actor: string,
  eventType: ClaimLedgerEntry["history"][0]["eventType"],
  notes: string,
  patch: Partial<ClaimLedgerEntry>,
  repoRoot?: string,
): { ok: true; claim: ClaimLedgerEntry } | { ok: false; error: string } {
  const claim = findClaimById(claimId, repoRoot);
  if (!claim) return { ok: false, error: "Claim not found" };

  const previous = claim.verificationStatus;
  const now = new Date().toISOString();
  const updated: ClaimLedgerEntry = {
    ...claim,
    ...patch,
    verificationStatus: nextStatus,
    updatedAt: now,
    lastReviewedAt: now,
    history: [
      ...claim.history,
      {
        timestamp: now,
        eventType,
        actor,
        previousStatus: previous,
        nextStatus,
        notes,
      },
    ],
  };

  upsertClaimLedgerEntry(updated, repoRoot);
  appendClaimLedgerAuditEvent(
    { eventType, claimId, actor, details: notes },
    repoRoot,
  );

  return { ok: true, claim: updated };
}

export function submitClaimForReview(
  claimId: string,
  actor: string,
  repoRoot?: string,
): { ok: true } | { ok: false; error: string } {
  const result = transitionClaim(
    claimId,
    "NEEDS_REVIEW",
    actor,
    "SUBMITTED_FOR_REVIEW",
    "Submitted for human review",
    {},
    repoRoot,
  );
  return result.ok ? { ok: true } : result;
}

export function approveClaimForInternalUse(
  claimId: string,
  reviewer: string,
  notes: string,
  repoRoot?: string,
): { ok: true } | { ok: false; error: string } {
  const claim = findClaimById(claimId, repoRoot);
  if (!claim) return { ok: false, error: "Claim not found" };
  if (!canClaimBePromoted(claim)) {
    return { ok: false, error: "Unsupported claims cannot be approved" };
  }
  if (claim.classification === "NEEDS_REVIEW" && !notes.trim()) {
    return { ok: false, error: "NEEDS_REVIEW claims require reviewer notes" };
  }

  const result = transitionClaim(
    claimId,
    "HUMAN_APPROVED_INTERNAL",
    reviewer,
    "APPROVED_INTERNAL",
    notes,
    {
      publishabilityStatus: "APPROVED_FOR_INTERNAL_USE",
      internalUseStatus: "SAFE_FOR_INTERNAL_STRATEGY",
      humanReview: {
        reviewedBy: reviewer,
        reviewedAt: new Date().toISOString(),
        decision: "APPROVED_INTERNAL",
        notes,
        requiredEdits: [],
        approvalScope: "INTERNAL",
      },
    },
    repoRoot,
  );
  return result.ok ? { ok: true } : result;
}

export function approveClaimForPublicAdaptation(
  claimId: string,
  reviewer: string,
  notes: string,
  repoRoot?: string,
): { ok: true } | { ok: false; error: string } {
  const claim = findClaimById(claimId, repoRoot);
  if (!claim) return { ok: false, error: "Claim not found" };
  if (!canClaimBeApprovedForPublicAdaptation(claim)) {
    return { ok: false, error: "Claim does not meet public adaptation requirements" };
  }
  if (!notes.trim()) {
    return { ok: false, error: "Public adaptation requires reviewer notes" };
  }

  const result = transitionClaim(
    claimId,
    "HUMAN_APPROVED_FOR_PUBLIC_ADAPTATION",
    reviewer,
    "APPROVED_PUBLIC_ADAPTATION",
    notes,
    {
      publishabilityStatus: "APPROVED_FOR_PUBLIC_ADAPTATION",
      internalUseStatus: "READY_FOR_REVIEWED_MESSAGE_USE",
      humanReview: {
        reviewedBy: reviewer,
        reviewedAt: new Date().toISOString(),
        decision: "APPROVED_PUBLIC_ADAPTATION",
        notes,
        requiredEdits: [],
        approvalScope: "PUBLIC_ADAPTATION",
      },
    },
    repoRoot,
  );
  return result.ok ? { ok: true } : result;
}

export function rejectClaim(
  claimId: string,
  reviewer: string,
  notes: string,
  repoRoot?: string,
): { ok: true } | { ok: false; error: string } {
  const result = transitionClaim(
    claimId,
    "REJECTED",
    reviewer,
    "REJECTED",
    notes,
    {
      publishabilityStatus: "NOT_PUBLISHABLE",
      internalUseStatus: "DO_NOT_USE",
      humanReview: {
        reviewedBy: reviewer,
        reviewedAt: new Date().toISOString(),
        decision: "REJECTED",
        notes,
        requiredEdits: [],
        approvalScope: "NONE",
      },
    },
    repoRoot,
  );
  return result.ok ? { ok: true } : result;
}

export function retireClaim(
  claimId: string,
  reviewer: string,
  notes: string,
  repoRoot?: string,
): { ok: true } | { ok: false; error: string } {
  const result = transitionClaim(
    claimId,
    "RETIRED",
    reviewer,
    "RETIRED",
    notes,
    {
      publishabilityStatus: "NOT_PUBLISHABLE",
      internalUseStatus: "DO_NOT_USE",
    },
    repoRoot,
  );
  return result.ok ? { ok: true } : result;
}

export function requireMoreEvidence(
  claimId: string,
  reviewer: string,
  notes: string,
  repoRoot?: string,
): { ok: true } | { ok: false; error: string } {
  const result = transitionClaim(
    claimId,
    "NEEDS_REVIEW",
    reviewer,
    "REQUIRES_MORE_EVIDENCE",
    notes,
    {
      publishabilityStatus: "NOT_PUBLISHABLE",
      internalUseStatus: "RESEARCH_ONLY",
      humanReview: {
        reviewedBy: reviewer,
        reviewedAt: new Date().toISOString(),
        decision: "REQUIRES_MORE_EVIDENCE",
        notes,
        requiredEdits: [notes],
        approvalScope: "NONE",
      },
    },
    repoRoot,
  );
  return result.ok ? { ok: true } : result;
}

export function approveClaimForPublicRelease(
  claimId: string,
  reviewer: string,
  notes: string,
  repoRoot?: string,
): { ok: true } | { ok: false; error: string } {
  const claim = findClaimById(claimId, repoRoot);
  if (!claim) return { ok: false, error: "Claim not found" };
  if (!exportControlAllowsPublicRelease(claim)) {
    return {
      ok: false,
      error: "Public release blocked — KH-4 export control must approve first",
    };
  }
  return { ok: false, error: "Public release not enabled in this pass" };
}
