import {
  findV4BillNarrative,
  isInIntegrity2021,
  loadDebateIntelligenceV4Packet,
} from "@/lib/intelligence/v4/debateIntelligenceV4";
import { buildBillActProofDeep, type BillActProofDeep } from "@/lib/intelligence/v4/billActProofDepth";
import { listSosQuestionsReferencingBill } from "@/lib/intelligence/v4/sosDebateQuestionBank";

export type ElectionPlanHammerBillDrillDown = BillActProofDeep & {
  relatedQuestions: Array<{ questionId: string; questionNumber: number; title: string }>;
};

export function loadElectionPlanHammerBillDrillDown(
  billNumber: string,
): ElectionPlanHammerBillDrillDown | null {
  const v4 = loadDebateIntelligenceV4Packet();
  const narrative = findV4BillNarrative(v4, billNumber);
  if (!narrative) return null;

  const in2021 = isInIntegrity2021(v4, billNumber);
  const themeHits = v4.themeMatrix.filter((t) =>
    t.bills.some((b) => b.toUpperCase() === billNumber.toUpperCase()),
  );

  const deep = buildBillActProofDeep(narrative, {
    inIntegrity2021: in2021,
    themeLabels: themeHits.map((t) => t.label),
  });

  return {
    ...deep,
    relatedQuestions: listSosQuestionsReferencingBill(billNumber),
  };
}
