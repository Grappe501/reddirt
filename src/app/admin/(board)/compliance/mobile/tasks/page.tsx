import Link from "next/link";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import { buildComplianceTasks } from "@/lib/compliance/tasks/build-compliance-tasks";

export const dynamic = "force-dynamic";

export default async function MobileTasksPage() {
  const tasks = (await buildComplianceTasks()).slice(0, 20);
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-2">
      <CompliancePageHeader eyebrow="Mobile tasks" title="Compliance Actions" description="Phone-first list of urgent blockers and next staff actions." />
      <ComplianceNav />
      {tasks.map((task) => (
        <article key={task.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm">
          <p className="font-heading text-lg font-bold text-kelly-text">{task.title}</p>
          <p>{task.priority} · {task.type}</p>
          <p className="mt-2 text-kelly-text/75">{task.notes[0]}</p>
          {task.relatedRecordLinks[0] ? <Link className="mt-3 inline-block rounded-full bg-kelly-navy px-4 py-2 font-bold text-white" href={task.relatedRecordLinks[0].href}>Open</Link> : null}
        </article>
      ))}
      {!tasks.length ? <p className="font-body text-sm text-kelly-muted">No mobile tasks right now.</p> : null}
    </div>
  );
}
