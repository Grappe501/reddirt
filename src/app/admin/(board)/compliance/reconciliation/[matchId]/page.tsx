import { notFound } from "next/navigation";
import { ComplianceCard, ComplianceNav, CompliancePageHeader, ComplianceWarningPanel } from "../../components";
import { buildReconciliationWorkbench } from "@/lib/compliance/reconciliation/reconciliation-workbench-storage";
import { ReconciliationMatchActions } from "../reconciliation-match-actions";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ matchId: string }> };

export default async function ReconciliationMatchDetailPage({ params }: Params) {
  const { matchId } = await params;
  const workbench = await buildReconciliationWorkbench();
  const match = workbench.matches.find((item) => item.id === matchId) ?? workbench.suggestedPreview.find((item) => item.id === matchId);
  if (!match) notFound();
  const isSavedMatch = "status" in match;
  const status = isSavedMatch ? match.status : "suggested";
  const explanation = isSavedMatch ? match.notes ?? "Saved reconciliation match." : match.explanation;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <CompliancePageHeader eyebrow="Reconciliation detail" title={matchId} description="Approve, lock, unlock, or annotate variance before filing." />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Confidence">{match.confidence}</ComplianceCard>
        <ComplianceCard title="Status">{status}</ComplianceCard>
        <ComplianceCard title="Bank amount">${match.bankAmount?.toFixed(2) ?? "n/a"}</ComplianceCard>
        <ComplianceCard title="Variance">{isSavedMatch && match.variance != null ? `$${match.variance.toFixed(2)}` : "n/a"}</ComplianceCard>
      </section>
      <ComplianceCard title="Explanation">{explanation}</ComplianceCard>
      {isSavedMatch ? (
        <ComplianceCard title="Treasurer actions">
          <ReconciliationMatchActions matchId={matchId} status={status} />
        </ComplianceCard>
      ) : (
        <ComplianceWarningPanel title="Suggested match only">
          Save this match to the workbench before approve/lock. Use imports and reconciliation preview to create a saved match record.
        </ComplianceWarningPanel>
      )}
    </div>
  );
}
