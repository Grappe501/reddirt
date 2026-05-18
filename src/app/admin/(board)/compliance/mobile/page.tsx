import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { buildComplianceExecutiveScore } from "@/lib/compliance/scoring/compliance-score";
import { buildComplianceTasks } from "@/lib/compliance/tasks/build-compliance-tasks";

export const dynamic = "force-dynamic";

export default async function ComplianceMobilePage() {
  const [score, tasks] = await Promise.all([buildComplianceExecutiveScore(), buildComplianceTasks()]);
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-2">
      <CompliancePageHeader eyebrow="Mobile" title="Candidate Compliance" description="Phone-first actions for receipts, blockers, approvals, and compliance score." />
      <ComplianceNav />
      <ComplianceCard title={`${score.score}/100 compliance score`}>Status: {score.status}. Review blockers before certification.</ComplianceCard>
      <ComplianceCard title="Snap receipt" href="/admin/compliance/mobile/receipt">Upload a receipt from camera and send it to review.</ComplianceCard>
      <ComplianceCard title="Mobile tasks" href="/admin/compliance/mobile/tasks">{tasks.filter((task) => task.priority === "urgent").length} urgent task(s).</ComplianceCard>
      <ComplianceCard title="Filing blockers" href="/admin/compliance/filing-readiness">Review readiness and sign only after treasurer/compliance approval.</ComplianceCard>
    </div>
  );
}
