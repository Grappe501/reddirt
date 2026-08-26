import Link from "next/link";
import { prisma } from "@/lib/db";
import { campaignManagerPageTitle } from "@/lib/admin/campaign-manager-workbench-labels";
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

export const metadata = {
  title: campaignManagerPageTitle("Task Packages"),
};

function UserSelect({ name, users, defaultValue }: { name: string; users: Array<{ id: string; name: string | null; email: string }>; defaultValue?: string | null }) {
  return (
    <select name={name} required defaultValue={defaultValue ?? ""} className="rounded-md border border-kelly-text/15 bg-white px-2 py-1.5 text-xs">
      <option value="">Select person</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name || user.email}
        </option>
      ))}
    </select>
  );
}

export default async function TaskPackagesPage() {
  const [packages, users, candidateTasks] = await Promise.all([
    listTaskPackages(120),
    prisma.user.findMany({ orderBy: [{ name: "asc" }, { email: "asc" }], take: 250, select: { id: true, name: true, email: true } }),
    prisma.campaignTask.findMany({
      where: { status: { not: "CANCELLED" } },
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
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/75">
            Guided campaign work built on the existing <code>CampaignTask</code> engine. Submission means ready for review; only verification closes the underlying task.
          </p>
        </div>
        <Link href="/admin/tasks" className="rounded-btn border border-kelly-text/15 bg-white px-4 py-2 text-sm font-semibold text-kelly-text">
          All tasks
        </Link>
      </div>

      <section className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Turn an existing task into a guided package</h2>
        <p className="mt-1 text-xs text-kelly-muted">No duplicate task is created. The package is attached to the task through governed ops metadata.</p>
        <form action={initializeTaskPackageAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-kelly-muted md:col-span-2">
            Existing task
            <select name="taskId" required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm normal-case tracking-normal text-kelly-text">
              <option value="">Select task</option>
              {unpackaged.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}{task.event ? ` — ${task.event.title}` : ""}{task.dueAt ? ` — due ${task.dueAt.toLocaleDateString()}` : ""}
                </option>
              ))}
            </select>
          </label>
          <input name="objective" placeholder="Objective: what must be true when this is done?" className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm md:col-span-2" />
          <textarea name="instructions" rows={4} placeholder={"Instructions — one step per line\nExample: Confirm host arrival contact\nConfirm parking location"} className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          <textarea name="acceptanceCriteria" rows={4} placeholder={"Acceptance criteria — one per line\nExample: Contact name and mobile recorded\nParking instructions confirmed"} className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-white md:col-span-2 md:w-fit">
            Create Task Package
          </button>
        </form>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-kelly-text">Active packages</h2>
            <p className="mt-1 text-xs text-kelly-muted">{packages.length} guided task package{packages.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="mt-4 space-y-5">
          {packages.map((task) => {
            const pkg = task.taskPackage;
            const claimedName = task.assignee?.name || task.assignee?.email || null;
            return (
              <article key={task.id} className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-bold text-kelly-text">{task.title}</h3>
                      <span className="rounded-full bg-kelly-navy/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-kelly-navy">{pkg.state.replaceAll("_", " ")}</span>
                      {task.blocksReadiness ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-900">Readiness blocker</span> : null}
                    </div>
                    <p className="mt-1 text-xs text-kelly-muted">
                      {task.event ? `${task.event.title} · ` : ""}{task.dueAt ? `Due ${task.dueAt.toLocaleString()} · ` : ""}{claimedName ? `Assigned ${claimedName}` : "Unassigned"}
                    </p>
                    {pkg.objective ? <p className="mt-3 text-sm text-kelly-text/80"><strong>Objective:</strong> {pkg.objective}</p> : null}
                  </div>
                  <span className="text-xs font-semibold text-kelly-muted">Task status: {task.status}</span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-md border border-kelly-text/10 bg-kelly-page/60 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-kelly-muted">Guidance</h4>
                    {pkg.instructions.length ? <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-kelly-text/80">{pkg.instructions.map((item, i) => <li key={`${task.id}-i-${i}`}>{item}</li>)}</ol> : <p className="mt-2 text-xs text-kelly-muted">No instructions added yet.</p>}
                    {pkg.acceptanceCriteria.length ? <><h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-kelly-muted">Done means</h4><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-kelly-text/80">{pkg.acceptanceCriteria.map((item, i) => <li key={`${task.id}-a-${i}`}>{item}</li>)}</ul></> : null}
                    {pkg.dependencyTaskIds.length ? <p className="mt-4 text-xs text-amber-900"><strong>Dependencies:</strong> {pkg.dependencyTaskIds.length} task(s) must be DONE before claim/submission.</p> : null}
                  </div>

                  <div className="rounded-md border border-kelly-text/10 bg-kelly-page/60 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-kelly-muted">Worksheet & proof</h4>
                    {Object.keys(pkg.worksheet).length ? <dl className="mt-2 space-y-1 text-sm">{Object.entries(pkg.worksheet).map(([key, value]) => <div key={key} className="flex gap-2"><dt className="font-semibold text-kelly-text">{key}:</dt><dd className="text-kelly-text/75">{String(value ?? "")}</dd></div>)}</dl> : <p className="mt-2 text-xs text-kelly-muted">No worksheet answers yet.</p>}
                    {pkg.proof.length ? <ul className="mt-3 space-y-1 text-xs text-kelly-text/80">{pkg.proof.map((proof) => <li key={proof.id}><strong>{proof.label}</strong>{proof.url ? <> · <a href={proof.url} className="text-kelly-slate underline" target="_blank" rel="noreferrer">open proof</a></> : null}{proof.note ? ` · ${proof.note}` : ""}</li>)}</ul> : null}
                  </div>
                </div>

                {pkg.state !== "VERIFIED" ? (
                  <div className="mt-5 grid gap-3 xl:grid-cols-2">
                    {(pkg.state === "OPEN" || pkg.state === "CHANGES_REQUESTED") ? (
                      <form action={claimTaskPackageAction} className="flex flex-wrap gap-2 rounded-md border border-kelly-text/10 p-3">
                        <input type="hidden" name="taskId" value={task.id} />
                        <UserSelect name="actorUserId" users={users} defaultValue={pkg.claimedByUserId || task.assignedUserId} />
                        <button className="rounded-md bg-kelly-navy px-3 py-1.5 text-xs font-bold text-white">Claim package</button>
                      </form>
                    ) : null}

                    <form action={saveTaskPackageWorksheetAction} className="flex flex-wrap gap-2 rounded-md border border-kelly-text/10 p-3">
                      <input type="hidden" name="taskId" value={task.id} />
                      <UserSelect name="actorUserId" users={users} defaultValue={pkg.claimedByUserId || task.assignedUserId} />
                      <input name="worksheetKey" required placeholder="field name" className="min-w-28 flex-1 rounded-md border border-kelly-text/15 px-2 py-1.5 text-xs" />
                      <input name="worksheetValue" placeholder="answer" className="min-w-36 flex-[2] rounded-md border border-kelly-text/15 px-2 py-1.5 text-xs" />
                      <button className="rounded-md bg-kelly-text px-3 py-1.5 text-xs font-bold text-white">Save answer</button>
                    </form>

                    <form action={addTaskPackageProofAction} className="grid gap-2 rounded-md border border-kelly-text/10 p-3 sm:grid-cols-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <UserSelect name="actorUserId" users={users} defaultValue={pkg.claimedByUserId || task.assignedUserId} />
                      <input name="label" required placeholder="proof label" className="rounded-md border border-kelly-text/15 px-2 py-1.5 text-xs" />
                      <input name="url" placeholder="https://…" className="rounded-md border border-kelly-text/15 px-2 py-1.5 text-xs" />
                      <input name="note" placeholder="proof note" className="rounded-md border border-kelly-text/15 px-2 py-1.5 text-xs" />
                      <button className="rounded-md bg-kelly-text px-3 py-1.5 text-xs font-bold text-white sm:col-span-2 sm:w-fit">Add proof</button>
                    </form>

                    {pkg.state !== "SUBMITTED" ? (
                      <form action={submitTaskPackageAction} className="flex flex-wrap gap-2 rounded-md border border-kelly-text/10 p-3">
                        <input type="hidden" name="taskId" value={task.id} />
                        <UserSelect name="actorUserId" users={users} defaultValue={pkg.claimedByUserId || task.assignedUserId} />
                        <input name="note" placeholder="submission note" className="min-w-40 flex-1 rounded-md border border-kelly-text/15 px-2 py-1.5 text-xs" />
                        <button className="rounded-md bg-kelly-gold px-3 py-1.5 text-xs font-bold text-kelly-text">Submit for PM review</button>
                      </form>
                    ) : null}
                  </div>
                ) : null}

                {pkg.state === "SUBMITTED" ? (
                  <div className="mt-5 grid gap-3 border-t border-kelly-text/10 pt-4 lg:grid-cols-2">
                    <form action={verifyTaskPackageAction} className="flex flex-wrap gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 p-3">
                      <input type="hidden" name="taskId" value={task.id} />
                      <UserSelect name="verifierUserId" users={users} />
                      <input name="note" placeholder="verification note" className="min-w-40 flex-1 rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-xs" />
                      <button className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">Verify & close task</button>
                    </form>
                    <form action={requestTaskPackageChangesAction} className="flex flex-wrap gap-2 rounded-md border border-amber-200 bg-amber-50/60 p-3">
                      <input type="hidden" name="taskId" value={task.id} />
                      <UserSelect name="verifierUserId" users={users} />
                      <input name="note" required placeholder="what must change?" className="min-w-40 flex-1 rounded-md border border-amber-200 bg-white px-2 py-1.5 text-xs" />
                      <button className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-bold text-white">Request changes</button>
                    </form>
                  </div>
                ) : null}

                {pkg.changesRequestedNote ? <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900"><strong>Changes requested:</strong> {pkg.changesRequestedNote}</p> : null}
                {pkg.verificationNote ? <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-900"><strong>Verified:</strong> {pkg.verificationNote}</p> : null}
              </article>
            );
          })}
          {packages.length === 0 ? <p className="rounded-md border border-dashed border-kelly-text/20 p-6 text-sm text-kelly-muted">No guided packages yet. Convert an existing task above.</p> : null}
        </div>
      </section>
    </div>
  );
}
