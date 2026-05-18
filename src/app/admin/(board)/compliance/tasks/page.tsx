import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { buildComplianceTasks } from "@/lib/compliance/tasks/build-compliance-tasks";

export const dynamic = "force-dynamic";

export default async function ComplianceTasksPage() {
  const tasks = await buildComplianceTasks();
  const urgent = tasks.filter((task) => task.priority === "urgent").length;
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Tasks" title="Compliance Task Center" description="Every missing field, document gap, bank match, rule verification, and filing blocker becomes an operator task." />
      <ComplianceNav />
      <StorageModeNotice />
      <ComplianceCard eyebrow="Approval" title="Lightning Approval Workbench" href="/admin/compliance/approval">
        Review AI-prepared compliance records one at a time, verify evidence, approve, reject, or request more information.
      </ComplianceCard>
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Open tasks">{tasks.length}</ComplianceCard>
        <ComplianceCard title="Urgent">{urgent}</ComplianceCard>
        <ComplianceCard title="Rule verification">{tasks.filter((task) => task.type === "rule_verification_required").length}</ComplianceCard>
        <ComplianceCard title="Bank/document blockers">{tasks.filter((task) => task.type === "missing_bank_match" || task.type === "missing_receipt").length}</ComplianceCard>
      </section>
      <section className="grid gap-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm text-kelly-text/75">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-heading text-lg font-bold text-kelly-text">{task.title}</p>
                <p>{task.type} · {task.priority} · {task.status}</p>
                {task.notes.map((note) => <p key={note} className="mt-1">{note}</p>)}
              </div>
              <div className="flex flex-wrap gap-2">
                {task.relatedRecordLinks.map((link) => (
                  <Link key={`${task.id}-${link.href}`} className="rounded-full border border-kelly-navy px-3 py-2 font-semibold text-kelly-navy" href={link.href}>{link.label}</Link>
                ))}
              </div>
            </div>
          </article>
        ))}
        {!tasks.length ? <p className="font-body text-sm text-kelly-text/70">No compliance tasks generated.</p> : null}
      </section>
    </div>
  );
}
