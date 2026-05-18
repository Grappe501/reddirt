import { loadFilingSnapshots } from "../filings/filing-storage";
import { loadStagedMoneyMovements } from "../money/money-movement-storage";

export type ComplianceAmendmentCandidate = {
  id: string;
  filingId: string;
  recordId: string;
  impact: "amount_changed" | "record_missing" | "documentation_changed" | "status_changed";
  explanation: string;
  draftAmendmentExplanation: string;
  humanReviewRequired: true;
};

export async function buildAmendmentCandidates(): Promise<ComplianceAmendmentCandidate[]> {
  const [filings, movements] = await Promise.all([loadFilingSnapshots(), loadStagedMoneyMovements()]);
  const candidates: ComplianceAmendmentCandidate[] = [];
  for (const filing of filings.filter((item) => item.status === "filed" || item.status === "certified")) {
    for (const recordId of filing.includedRecordIds) {
      const movement = movements.find((item) => item.id === recordId);
      if (!movement) {
        candidates.push(candidate(filing.id, recordId, "record_missing", "Included record is no longer present in staged storage."));
      } else if (movement.approvalStatus !== "approved") {
        candidates.push(candidate(filing.id, recordId, "status_changed", "Included record approval status changed after filing snapshot."));
      } else if (movement.documentationStatus !== "complete") {
        candidates.push(candidate(filing.id, recordId, "documentation_changed", "Included record documentation is no longer complete."));
      }
    }
  }
  return candidates;
}

function candidate(filingId: string, recordId: string, impact: ComplianceAmendmentCandidate["impact"], explanation: string): ComplianceAmendmentCandidate {
  return {
    id: `amend-${filingId}-${recordId}-${impact}`,
    filingId,
    recordId,
    impact,
    explanation,
    draftAmendmentExplanation: `Potential amendment review: ${explanation} Compliance officer should compare the filed report against current records and decide whether an amended filing is required.`,
    humanReviewRequired: true,
  };
}
