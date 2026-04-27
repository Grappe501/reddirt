import Link from "next/link";
import { OwnedMediaStorageBackend, SignupSheetEntryStatus } from "@prisma/client";
import {
  approveSignupEntryAction,
  rejectSignupEntryAction,
  runSignupExtractionAction,
  setEntryVoterOverrideAction,
  skipSignupEntryAction,
  updateSignupEntryAction,
} from "@/app/admin/volunteer-intake-actions";
import { prisma } from "@/lib/db";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";

type Props = { params: Promise<{ documentId: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function VolunteerIntakeDocumentPage({ params, searchParams }: Props) {
  const { documentId } = await params;
  const sp = await searchParams;

  const doc = await prisma.signupSheetDocument.findUnique({
    where: { id: documentId },
    include: {
      ownedMedia: true,
      lastExtraction: true,
      entries: {
        where: {},
        orderBy: { rowIndex: "asc" },
        include: {
          county: { select: { displayName: true, slug: true } },
          matchCandidates: { orderBy: [{ score: "desc" }, { rank: "asc" }], include: { voterRecord: true } },
        },
      },
    },
  });

  if (!doc) {
    return (
      <div>
        <p>Not found.</p>
        <Link href="/admin/volunteers/intake" className="text-kelly-slate underline">
          Back
        </Link>
      </div>
    );
  }

  const fileUrl =
    doc.ownedMedia.publicUrl ||
    (doc.ownedMedia.storageBackend === OwnedMediaStorageBackend.LOCAL_DISK ? getOwnedFilePublicPath(doc.ownedMedia.id) : "#");

  const voterRollCount = await prisma.voterRecord.count({ where: { inLatestCompletedFile: true } });
  const voterWithNames = await prisma.voterRecord.count({
    where: { inLatestCompletedFile: true, firstName: { not: null }, lastName: { not: null } },
  });

  const isImage = doc.ownedMedia.mimeType.startsWith("image/");

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-12">
      <div>
        <Link href="/admin/volunteers/intake" className="text-sm text-kelly-slate hover:underline">
          ← Intake list
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">{doc.ownedMedia.title}</h1>
        <p className="font-mono text-[11px] text-kelly-text/50">{doc.id}</p>
        <p className="mt-1 text-sm text-kelly-text/70">
          Status: <strong>{doc.status}</strong> · Voter roll rows: <strong>{voterRollCount}</strong> (
          <strong>{voterWithNames}</strong> with first+last from file)
        </p>
        {voterRollCount === 0 ? (
          <p className="mt-2 rounded-md border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            No voter file loaded — matching is unavailable. Run a voter import from{" "}
            <Link href="/admin/voter-import" className="font-semibold underline">
              Voter file
            </Link>
            . If your file includes FIRST_NAME / LAST_NAME / PHONE columns, map them (see voter file docs) for best
            matches.
          </p>
        ) : null}
        {sp.extracted || sp.saved || sp.approved || sp.rejected || sp.skipped || sp.voter ? (
          <p className="mt-2 rounded-md border border-emerald-600/20 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900">Updated.</p>
        ) : null}
        {sp.error === "extract" ? (
          <p className="mt-2 rounded-md border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-800">
            Extraction failed — check OPENAI_API_KEY and file type (image or text-based PDF).
          </p>
        ) : null}
        {sp.error === "email" ? (
          <p className="mt-2 rounded-md border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-800">
            A valid email is required to create a user.
          </p>
        ) : null}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4 shadow-sm">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">Original sheet</h2>
          <div className="mt-3 max-h-[min(70vh,560px)] overflow-auto rounded-md border border-kelly-text/10 bg-kelly-text/5 p-2">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl} alt="" className="mx-auto max-h-[520px] w-auto object-contain" />
            ) : (
              <p className="text-sm text-kelly-text/70">
                Preview: <a href={fileUrl} className="text-kelly-slate underline" target="_blank" rel="noreferrer">
                  Open file
                </a>{" "}
                (PDF or non-image)
              </p>
            )}
          </div>
          <form action={runSignupExtractionAction} className="mt-4">
            <input type="hidden" name="documentId" value={doc.id} />
            <button
              type="submit"
              className="rounded-btn bg-kelly-navy px-4 py-2 text-sm font-bold text-kelly-page"
            >
              Run / re-run extraction
            </button>
            <p className="mt-2 text-xs text-kelly-text/55">Re-run replaces entries for a new extraction pass (pending rows rematched).</p>
          </form>
        </div>
        <div className="rounded-card border border-kelly-text/10 bg-white/80 p-4 text-sm text-kelly-text/80">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">Latest extraction</h2>
          {doc.lastExtraction ? (
            <>
              <p className="mt-2">
                Model: {doc.lastExtraction.model ?? "—"} · Avg confidence:{" "}
                {doc.lastExtraction.avgConfidence != null ? doc.lastExtraction.avgConfidence.toFixed(2) : "—"}
              </p>
              {doc.lastExtraction.rawOcrText ? (
                <pre className="mt-2 max-h-48 overflow-auto rounded border border-kelly-text/10 bg-white p-2 font-mono text-[10px] text-kelly-text/70">
                  {doc.lastExtraction.rawOcrText.slice(0, 4000)}
                  {doc.lastExtraction.rawOcrText.length > 4000 ? "…" : ""}
                </pre>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-kelly-text/60">No extraction yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Rows</h2>
        {doc.entries.map((e) => (
          <article
            key={e.id}
            className={`rounded-xl border p-4 shadow-sm ${
              e.approvalStatus === SignupSheetEntryStatus.PENDING_REVIEW
                ? "border-amber-200/80 bg-amber-50/40"
                : "border-kelly-text/10 bg-kelly-page/80"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] text-kelly-text/45">
                  Row {e.rowIndex} · {e.id} · OCR confidence: {e.confidenceScore != null ? e.confidenceScore.toFixed(2) : "—"}
                </p>
                <p className="mt-1 text-xs text-kelly-text/60">
                  Status: <strong>{e.approvalStatus}</strong>
                  {e.decidedAt ? ` · ${e.decidedAt.toLocaleString()}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/55">Raw line</p>
                <p className="mt-1 whitespace-pre-wrap rounded border border-kelly-text/10 bg-white p-2 text-sm">{e.rawRowText}</p>
              </div>
              <form action={updateSignupEntryAction} className="space-y-2">
                <input type="hidden" name="entryId" value={e.id} />
                <input type="hidden" name="documentId" value={documentId} />
                <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/55">Normalized (editable)</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs">
                    First
                    <input name="firstName" defaultValue={e.firstName ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                  </label>
                  <label className="text-xs">
                    Last
                    <input name="lastName" defaultValue={e.lastName ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                  </label>
                </div>
                <label className="text-xs">
                  Email
                  <input name="email" type="email" defaultValue={e.email ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                </label>
                <label className="text-xs">
                  Phone
                  <input name="phone" defaultValue={e.phone ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                </label>
                <label className="text-xs">
                  Address
                  <input name="address" defaultValue={e.address ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                </label>
                <label className="text-xs">
                  County (free text)
                  <input name="countyText" defaultValue={e.countyText ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                </label>
                <label className="text-xs">
                  Staff notes
                  <textarea name="notes" rows={2} defaultValue={e.notes ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                </label>
                <button type="submit" className="rounded-md bg-kelly-text/10 px-3 py-1.5 text-xs font-semibold text-kelly-text">
                  Save row + refresh matches
                </button>
              </form>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-kelly-text/55">Voter matches (heuristic)</p>
              {e.matchCandidates.length === 0 ? (
                <p className="mt-1 text-sm text-kelly-text/60">
                  No candidates. Add county or phone on the row, ensure voter file has matching name fields, or pick a voter id
                  manually below.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {e.matchCandidates.map((m) => (
                    <li key={m.id} className="rounded border border-kelly-text/10 bg-white/80 px-2 py-1 font-mono text-[11px]">
                      score {m.score.toFixed(2)} · {m.voterRecord.voterFileKey} · {m.voterRecord.countySlug}{" "}
                      {m.voterRecord.city ? `· ${m.voterRecord.city}` : ""}
                    </li>
                  ))}
                </ul>
              )}
              <form action={setEntryVoterOverrideAction} className="mt-2 flex flex-wrap items-end gap-2">
                <input type="hidden" name="entryId" value={e.id} />
                <input type="hidden" name="documentId" value={documentId} />
                <label className="text-xs">
                  Manual VoterRecord id
                  <input
                    name="matchedVoterRecordId"
                    defaultValue={e.matchedVoterRecordId ?? ""}
                    placeholder="cuid from voter admin / DB"
                    className="mt-0.5 w-full min-w-[200px] rounded border border-kelly-text/15 px-2 py-1 font-mono text-[11px]"
                  />
                </label>
                <button type="submit" className="rounded-md border border-kelly-text/20 bg-white px-2 py-1 text-xs font-semibold">
                  Save selection
                </button>
              </form>
            </div>

            {e.approvalStatus === SignupSheetEntryStatus.PENDING_REVIEW ? (
              <div className="mt-4 flex flex-col gap-3 border-t border-kelly-text/10 pt-4">
                <form action={approveSignupEntryAction} className="space-y-2 rounded-md border border-emerald-200/50 bg-emerald-50/40 p-3">
                  <p className="text-xs font-bold text-emerald-900">Approve (creates/updates user + volunteer profile)</p>
                  <input type="hidden" name="entryId" value={e.id} />
                  <input type="hidden" name="documentId" value={documentId} />
                  <label className="text-xs">
                    Email (required)
                    <input name="email" type="email" required defaultValue={e.email ?? ""} className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                  </label>
                  <label className="text-xs">
                    Decision note
                    <input name="decisionNote" className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-sm" />
                  </label>
                  <button type="submit" className="rounded-btn bg-emerald-800 px-4 py-2 text-sm font-bold text-kelly-page">
                    Approve volunteer
                  </button>
                </form>
                <div className="flex flex-wrap gap-2">
                  <form action={rejectSignupEntryAction}>
                    <input type="hidden" name="entryId" value={e.id} />
                    <input type="hidden" name="documentId" value={documentId} />
                    <input type="hidden" name="decisionNote" value="rejected" />
                    <button type="submit" className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-900">
                      Reject
                    </button>
                  </form>
                  <form action={skipSignupEntryAction}>
                    <input type="hidden" name="entryId" value={e.id} />
                    <input type="hidden" name="documentId" value={documentId} />
                    <button type="submit" className="rounded-md border border-kelly-text/20 bg-white px-3 py-1.5 text-xs font-semibold">
                      Skip
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </article>
        ))}
        {doc.entries.length === 0 ? (
          <p className="text-sm text-kelly-text/60">No rows yet. Run extraction.</p>
        ) : null}
      </section>
    </div>
  );
}
