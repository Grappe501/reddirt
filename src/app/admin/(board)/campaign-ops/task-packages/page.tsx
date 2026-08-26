import Link from "next/link";
import { CampaignTaskStatus } from "@prisma/client";
import { campaignManagerPageTitle } from "@/lib/admin/campaign-manager-workbench-labels";
import { prisma } from "@/lib/db";
import { listTaskPackages } from "@/lib/campaign-ops/task-package-service";
import { readTaskPackageMetadata } from "@/lib/campaign-ops/task-packages";
import {
  addTaskPackageProofAction,
  claimTaskPackageAction,
  initializeTaskPackageAction,
  requestTaskPackageChangesAction,
  saveTaskPackageWorksheetAction,
  submitTaskPackageAction,
  verifyTaskPackageAction,
} from "./actions";

export const metadata = { title: campaignManagerPageTitle("Task Packages") };

type UserChoice = { id: string; name: string | null; email: string };
function UserSelect({ name, users, defaultValue }: { name: string; users: UserChoice[]; defaultValue?: string | null }) {
  return (
    <select name={name} required defaultValue={defaultValue ?? ""} className="rounded-md border border-kelly-text/15 bg-white px-2 py-1.5 text-xs">
      <option value="">Select person</option>
      {users.map((user) => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
    </select>
  );
}

export default async function TaskPackagesPage() {
  const [packages, users, candidateTasks] = await Promise.all([
    listTaskPackages(120),
    prisma.user.findMany({ orderBy: [{ name: "asc" }, { email: "asc" }], take: 250, select: { id: true, name: true, email: true } }),
    prisma.campaignTask.findMany({
      where: { status: { not: CampaignTaskStatus.CANCELLED } },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 150,
      select: { id: true, title: true, dueAt: true, event: { select: { title: true } }, opsMetadataJson: true },
    }),
  ]);
  const unpackaged = candidateTasks.filter((task) => !readTaskPackageMetadata(task.opsMetadataJson));

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-kelly-text">Task Packages</h1>
          <p className="mt-2 max-w-3xl text-sm text-kelly-text/75">Guided work layered onto canonical CampaignTask records. Submission is review-ready; verification is what closes the task.</p>
        </div>
        <Link href="/admin/tasks" className="rounded-btn border border-kelly-text/15 bg-white px-4 py-2 text-sm font-semibold text-kelly-text">All tasks</Link>
      </div>

      <section className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Create a guided package from an existing task</h2>
        <form action={initializeTaskPackageAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <select name="taskId" required className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm md:col-span-2">
            <option value="">Select task</option>
            {unpackaged.map((task) => <option key={task.id} value={task.id}>{task.title}{task.event ? ` — ${task.event.title}` : ""}{task.dueAt ? ` — due ${task.dueAt.toLocaleDateString()}` : ""}</option>)}
          </select>
          <input name="objective" placeholder="Objective: what must be true when this is done?" className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm md:col-span-2" />
          <textarea name="instructions" rows={4} placeholder="Instructions — one step per line" className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          <textarea name="acceptanceCriteria" rows={4} placeholder="Acceptance criteria — one per line" className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          <button className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-white md:col-span-2 md:w-fit">Create Task Package</button>
        </form>
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Active packages ({packages.length})</h2>
        {packages.map((task) => {
          const pkg = task.taskPackage;
          const actorId = pkg.claimedByUserId || task.assignedUserId;
          return (
            <article key={task.id} className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold text-kelly-text">{task.title}</h3>
                  <p className="mt-1 text-xs text-kelly-muted">{task.event ? `${task.event.title} · ` : ""}{task.dueAt ? `Due ${task.dueAt.toLocaleString()} · ` : ""}{task.blocksReadiness ? "Readiness blocker" : "Non-blocking"}</p>
                </div>
                <span className="rounded-full bg-kelly-navy/10 px-2 py-1 text-[10px] font-bold uppercase text-kelly-navy">{pkg.state.replaceAll("_", " ")}</span>
              </div>
              {pkg.objective ? <p className="mt-3 text-sm text-kelly-text/80"><strong>Objective:</strong> {pkg.objective}</p> : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-kelly-text/10 bg-kelly-page/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-kelly-muted">Steps</h4>
                  {pkg.instructions.length ? <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">{pkg.instructions.map((item, i) => <li key={i}>{item}</li>)}</ol> : <p className="mt-2 text-xs text-kelly-muted">No steps yet.</p>}
                  {pkg.acceptanceCriteria.length ? <><h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-kelly-muted">Done means</h4><ul className="mt-2 list-inside list-disc space-y-1 text-sm">{pkg.acceptanceCriteria.map((item, i) => <li key={i}>{item}</li>)}</ul></> : null}
                </div>
                <div className="rounded-md border border-kelly-text/10 bg-kelly-page/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-kelly-muted">Worksheet / proof</h4>
                  {Object.entries(pkg.worksheet).map(([key, value]) => <p key={key} className="mt-1 text-sm"><strong>{key}:</strong> {String(value ?? "")}</p>)}
                  {pkg.proof.map((proof) => <p key={proof.id} className="mt-1 text-xs"><strong>{proof.label}</strong>{proof.url ? <> · <a href={proof.url} target="_blank" rel="noreferrer" className="underline">open</a></> : null}{proof.note ? ` · ${proof.note}` : ""}</p>)}
                </div>
              </div>

              {pkg.state !== "VERIFIED" ? <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {(pkg.state === "OPEN" || pkg.state === "CHANGES_REQUESTED") ? <form action={claimTaskPackageAction} className="flex flex-wrap gap-2 border border-kelly-text/10 p-3"><input type="hidden" name="taskId" value={task.id} /><UserSelect name="actorUserId" users={users} defaultValue={actorId} /><button className="rounded-md bg-kelly-navy px-3 py-1.5 text-xs font-bold text-white">Claim</button></form> : null}
                <form action={saveTaskPackageWorksheetAction} className="flex flex-wrap gap-2 border border-kelly-text/10 p-3"><input type="hidden" name="taskId" value={task.id} /><UserSelect name="actorUserId" users={users} defaultValue={actorId} /><input name="worksheetKey" required placeholder="field" className="rounded-md border px-2 py-1.5 text-xs" /><input name="worksheetValue" placeholder="answer" className="rounded-md border px-2 py-1.5 text-xs" /><button className="rounded-md bg-kelly-text px-3 py-1.5 text-xs font-bold text-white">Save answer</button></form>
                <form action={addTaskPackageProofAction} className="flex flex-wrap gap-2 border border-kelly-text/10 p-3"><input type="hidden" name="taskId" value={task.id} /><UserSelect name="actorUserId" users={users} defaultValue={actorId} /><input name="label" required placeholder="proof label" className="rounded-md border px-2 py-1.5 text-xs" /><input name="url" placeholder="https://…" className="rounded-md border px-2 py-1.5 text-xs" /><input name="note" placeholder="note" className="rounded-md border px-2 py-1.5 text-xs" /><button className="rounded-md bg-kelly-text px-3 py-1.5 text-xs font-bold text-white">Add proof</button></form>
                {pkg.state !== "SUBMITTED" ? <form action={submitTaskPackageAction} className="flex flex-wrap gap-2 border border-kelly-text/10 p-3"><input type="hidden" name="taskId" value={task.id} /><UserSelect name="actorUserId" users={users} defaultValue={actorId} /><input name="note" placeholder="submission note" className="rounded-md border px-2 py-1.5 text-xs" /><button className="rounded-md bg-kelly-gold px-3 py-1.5 text-xs font-bold text-kelly-text">Submit for PM review</button></form> : null}
              </div> : null}

              {pkg.state === "SUBMITTED" ? <div className="mt-4 grid gap-3 border-t pt-4 lg:grid-cols-2">
                <form action={verifyTaskPackageAction} className="flex flex-wrap gap-2 bg-emerald-50 p-3"><input type="hidden" name="taskId" value={task.id} /><UserSelect name="verifierUserId" users={users} /><input name="note" placeholder="verification note" className="rounded-md border px-2 py-1.5 text-xs" /><button className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">Verify & close</button></form>
                <form action={requestTaskPackageChangesAction} className="flex flex-wrap gap-2 bg-amber-50 p-3"><input type="hidden" name="taskId" value={task.id} /><UserSelect name="verifierUserId" users={users} /><input name="note" required placeholder="required changes" className="rounded-md border px-2 py-1.5 text-xs" /><button className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-bold text-white">Request changes</button></form>
              </div> : null}
              {pkg.changesRequestedNote ? <p className="mt-3 bg-amber-50 px-3 py-2 text-xs text-amber-900"><strong>Changes requested:</strong> {pkg.changesRequestedNote}</p> : null}
            </article>
          );
        })}
        {!packages.length ? <p className="rounded-md border border-dashed p-6 text-sm text-kelly-muted">No Task Packages yet.</p> : null}
      </section>
    </div>
  );
}
