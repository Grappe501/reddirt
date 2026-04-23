import { ComplianceDocumentType } from "@prisma/client";
import {
  setComplianceDocumentAiApprovalAction,
  uploadComplianceDocumentAction,
} from "@/app/admin/compliance-documents-actions";
import {
  complianceDocumentTypeLabel,
} from "@/lib/campaign-engine/compliance-documents";
import { prisma } from "@/lib/db";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const dynamic = "force-dynamic";

const ORDER = Object.values(ComplianceDocumentType);

export default async function ComplianceDocumentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const err = typeof sp.error === "string" ? sp.error : null;
  const saved = sp.saved === "1";
  const updated = sp.updated === "1";

  const rows = await prisma.complianceDocument.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="max-w-4xl text-deep-soil">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/80">
        Governance · COMP-2
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Compliance documents</h1>
      <p className="mt-2 max-w-2xl font-body text-sm text-deep-soil/70">
        Uploads are stored on the campaign file store and listed here for staff.{" "}
        <strong>Uploaded ≠ trusted for AI</strong> until a reviewer marks &quot;Approved for AI reference&quot; (RAG / index
        wiring is a later packet; see <code className="text-xs">docs/compliance-document-ingest-foundation.md</code> in the
        repo).
      </p>

      {err === "upload" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          Upload failed (missing file, bad MIME, or file too large).
        </p>
      ) : null}
      {err === "date" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          Invalid date.
        </p>
      ) : null}
      {saved ? (
        <p className="mt-4 rounded-md border border-emerald-600/30 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Document saved.
        </p>
      ) : null}
      {updated ? (
        <p className="mt-4 rounded-md border border-emerald-600/30 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Record updated.
        </p>
      ) : null}

      <form
        action={uploadComplianceDocumentAction}
        className="mt-8 space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
        encType="multipart/form-data"
      >
        <h2 className="font-heading text-lg font-bold">Upload a document</h2>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">File</span>
          <input name="file" type="file" required className="mt-1 w-full text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
          <input name="title" type="text" className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Document type</span>
          <select
            name="documentType"
            className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            defaultValue="OTHER"
          >
            {ORDER.map((k) => (
              <option key={k} value={k}>
                {complianceDocumentTypeLabel[k]}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Reporting period (text)</span>
            <input
              name="reportingPeriod"
              type="text"
              placeholder="e.g. Q1 2026"
              className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Period / document date</span>
            <input name="periodDate" type="date" className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Notes</span>
          <textarea name="notes" rows={3} className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="approvedForAi" className="mt-0.5" />
          <span>Approved for AI reference (opt-in; default off for new uploads)</span>
        </label>
        <button
          type="submit"
          className="rounded-md bg-red-dirt px-4 py-2 font-body text-sm font-semibold text-cream-canvas hover:opacity-95"
        >
          Upload
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-heading text-lg font-bold">Recent uploads</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-deep-soil/60">No documents yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-deep-soil/10 rounded border border-deep-soil/10 bg-cream-canvas">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-deep-soil/60">
                    {complianceDocumentTypeLabel[r.documentType]} · {r.fileName} ·{" "}
                    {r.approvedForAiReference ? (
                      <span className="text-emerald-800">AI ref OK</span>
                    ) : (
                      <span>not approved for AI</span>
                    )}
                  </p>
                  {r.reportingPeriod || r.periodDate ? (
                    <p className="text-xs text-deep-soil/50">
                      {r.reportingPeriod}
                      {r.reportingPeriod && r.periodDate ? " · " : ""}
                      {r.periodDate ? r.periodDate.toISOString().slice(0, 10) : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/compliance-documents/${encodeURIComponent(r.id)}/file`}
                    className="text-sm font-medium text-red-dirt underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </a>
                  <form action={setComplianceDocumentAiApprovalAction} className="flex items-center gap-1 text-xs">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="approvedForAi" value={r.approvedForAiReference ? "" : "on"} />
                    <button type="submit" className="rounded border border-deep-soil/20 px-2 py-1 hover:bg-deep-soil/5">
                      {r.approvedForAiReference ? "Revoke AI ref" : "Mark AI ref OK"}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
