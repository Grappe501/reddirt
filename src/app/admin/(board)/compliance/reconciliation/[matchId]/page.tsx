import { notFound } from "next/navigation";
import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";
import { buildReconciliationWorkbench } from "@/lib/compliance/reconciliation/reconciliation-workbench-storage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ matchId: string }> };

export default async function ReconciliationMatchDetailPage({ params }: Params) {
  const { matchId } = await params;
  const workbench = await buildReconciliationWorkbench();
  const match = workbench.matches.find((item) => item.id === matchId) ?? workbench.suggestedPreview.find((item) => item.id === matchId);
  if (!match) notFound();
  const isSavedMatch = "status" in match;
  const explanation = isSavedMatch ? match.notes ?? "Saved reconciliation match." : match.explanation;
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Reconciliation detail" title={matchId} description="Review suggested/saved match evidence, variance, approval state, and locking requirements." />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Confidence">{match.confidence}</ComplianceCard>
        <ComplianceCard title="Status">{isSavedMatch ? match.status : "suggested"}</ComplianceCard>
        <ComplianceCard title="Bank amount">${match.bankAmount?.toFixed(2) ?? "n/a"}</ComplianceCard>
        <ComplianceCard title="Human review">{match.humanReviewRequired ? "required" : "still recommended"}</ComplianceCard>
      </section>
      <ComplianceCard title="Explanation">{explanation}</ComplianceCard>
      <ComplianceCard title="Actions foundation">
        Force match, split match, mark transfer, mark ignored, record variance, approve match, and lock reconciled transactions are represented in the workbench model. Final mutation buttons should be enabled after treasurer workflow approval rules are confirmed.
      </ComplianceCard>
    </div>
  );
}
