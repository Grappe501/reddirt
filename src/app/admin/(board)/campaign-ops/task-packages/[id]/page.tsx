import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { readTaskPackageMetadata } from "@/lib/campaign-ops/task-packages";
import {
  addTaskPackageProofAction,
  claimTaskPackageAction,
  requestTaskPackageChangesAction,
  saveTaskPackageWorksheetAction,
  submitTaskPackageAction,
  verifyTaskPackageAction,
} from "../actions";

type Props = { params: Promise<{ id: string }> };
type UserChoice = { id: string; name: string | null; email: string };

function UserSelect({ name, users, defaultValue }: { name: string; users: UserChoice[]; defaultValue?: string | null }) {
  return <select name={name} required defaultValue={defaultValue ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">Select person</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}</select>;
}

export default async function TaskPackageWorkPage({ params }: Props) {
  const { id } = await params;
  const [task, users] = await Promise.all([
    prisma.campaignTask.findUnique({ where: { id }, include: { event: { select: { id: true, title: true } }, assignee: { select: { name: true, email: true } } } }),
    prisma.user.findMany({ orderBy: [{ name: "asc" }, { email: "asc" }], select: { id: true, name: true, email: true }, take: 300 }),
  ]);
  if (!task) notFound();
  const pkg = readTaskPackageMetadata(task.opsMetadataJson);
  if (!pkg) notFound();
  const actorId = pkg.claimedByUserId || task.assignedUserId;
  const canWork = Boolean(actorId) && pkg.state !== "VERIFIED" && pkg.state !== "SUBMITTED";

  return <main className="mx-auto max-w-4xl space-y-6 p-6">
    <header className="space-y-2"><p className="text-sm">{task.event ? <Link className="underline" href={`/admin/campaign-ops/events/${task.event.id}`}>← {task.event.title}</Link> : <Link className="underline" href="/admin/campaign-ops/task-packages">← Task Packages</Link>}</p><h1 className="text-3xl font-bold">{task.title}</h1><p className="text-slate-600">{task.event?.title || "Campaign task"} · {task.dueAt ? `Due ${task.dueAt.toLocaleString()}` : "No due date"} · {task.blocksReadiness ? "Readiness blocker" : "Non-blocking"}</p><span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{pkg.state.replaceAll("_", " ")}</span></header>

    {pkg.objective ? <section className="rounded-xl border p-5"><h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Your assignment</h2><p className="mt-2 text-lg">{pkg.objective}</p></section> : null}

    <section className="rounded-xl border p-5"><h2 className="text-xl font-semibold">Do this step by step</h2>{pkg.instructions.length ? <ol className="mt-4 list-decimal space-y-3 pl-6">{pkg.instructions.map((step, index) => <li key={index} className="pl-2">{step}</li>)}</ol> : <p className="mt-3 text-slate-500">No instructions have been added.</p>}</section>

    <section className="rounded-xl border p-5"><h2 className="text-xl font-semibold">Done means</h2><ul className="mt-3 list-disc space-y-2 pl-6">{pkg.acceptanceCriteria.map((item, index) => <li key={index}>{item}</li>)}</ul></section>

    {(pkg.state === "OPEN" || pkg.state === "CHANGES_REQUESTED") ? <section className="rounded-xl border p-5"><h2 className="text-xl font-semibold">Claim this assignment</h2><p className="mt-1 text-sm text-slate-600">Choose the volunteer or staff member who will own this work. Once claimed, the worksheet opens below.</p><form action={claimTaskPackageAction} className="mt-4 flex flex-wrap gap-2"><input type="hidden" name="taskId" value={task.id}/><UserSelect name="actorUserId" users={users} defaultValue={actorId}/><button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Claim this task</button></form></section> : null}

    {canWork ? <section className="space-y-4 rounded-xl border p-5"><h2 className="text-xl font-semibold">Work sheet</h2><form action={saveTaskPackageWorksheetAction} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]"><input type="hidden" name="taskId" value={task.id}/><input type="hidden" name="actorUserId" value={actorId ?? ""}/><input required name="worksheetKey" placeholder="Field / question" className="rounded border px-3 py-2 text-sm"/><input name="worksheetValue" placeholder="Your answer" className="rounded border px-3 py-2 text-sm"/><button className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white">Save</button></form>{Object.entries(pkg.worksheet).length ? <div className="rounded bg-slate-50 p-4 text-sm">{Object.entries(pkg.worksheet).map(([key, value]) => <p key={key}><strong>{key}:</strong> {String(value ?? "")}</p>)}</div> : null}</section> : null}

    {canWork ? <section className="space-y-4 rounded-xl border p-5"><h2 className="text-xl font-semibold">Proof / deliverables</h2><form action={addTaskPackageProofAction} className="grid gap-2"><input type="hidden" name="taskId" value={task.id}/><input type="hidden" name="actorUserId" value={actorId ?? ""}/><input required name="label" placeholder="What are you submitting?" className="rounded border px-3 py-2 text-sm"/><input name="url" placeholder="Link, if applicable" className="rounded border px-3 py-2 text-sm"/><textarea name="note" placeholder="Note" className="rounded border px-3 py-2 text-sm"/><button className="w-fit rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white">Add proof</button></form>{pkg.proof.map((proof) => <div key={proof.id} className="rounded bg-slate-50 p-3 text-sm"><strong>{proof.label}</strong>{proof.url ? <> · <a className="underline" href={proof.url} target="_blank" rel="noreferrer">open</a></> : null}{proof.note ? <div>{proof.note}</div> : null}</div>)}</section> : null}

    {pkg.changesRequestedNote ? <section className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-semibold">Changes requested</h2><p className="mt-2">{pkg.changesRequestedNote}</p></section> : null}

    {canWork ? <form action={submitTaskPackageAction} className="rounded-xl border bg-slate-50 p-5"><input type="hidden" name="taskId" value={task.id}/><input type="hidden" name="actorUserId" value={actorId ?? ""}/><label className="block text-sm font-semibold">Completion note</label><textarea name="note" className="mt-2 w-full rounded border px-3 py-2" placeholder="What did you complete?"/><button className="mt-3 rounded bg-slate-900 px-5 py-2 font-semibold text-white">Submit for PM review</button></form> : null}

    {pkg.state === "SUBMITTED" ? <section className="grid gap-4 md:grid-cols-2"><form action={verifyTaskPackageAction} className="rounded-xl border border-emerald-300 bg-emerald-50 p-5"><h2 className="font-semibold">Verify work</h2><div className="mt-3"><UserSelect name="verifierUserId" users={users}/></div><input type="hidden" name="taskId" value={task.id}/><textarea name="note" className="mt-2 w-full rounded border px-3 py-2" placeholder="Verification note"/><button className="mt-3 rounded bg-emerald-700 px-4 py-2 font-semibold text-white">Verify & close</button></form><form action={requestTaskPackageChangesAction} className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-semibold">Send back</h2><div className="mt-3"><UserSelect name="verifierUserId" users={users}/></div><input type="hidden" name="taskId" value={task.id}/><textarea required name="note" className="mt-2 w-full rounded border px-3 py-2" placeholder="What needs to change?"/><button className="mt-3 rounded bg-amber-700 px-4 py-2 font-semibold text-white">Request changes</button></form></section> : null}

    {pkg.state === "VERIFIED" ? <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-5"><h2 className="text-xl font-semibold">Task verified and closed</h2><p className="mt-2 text-sm">{pkg.verificationNote || task.completionNotes || "Verified by campaign management."}</p></section> : null}
  </main>;
}
