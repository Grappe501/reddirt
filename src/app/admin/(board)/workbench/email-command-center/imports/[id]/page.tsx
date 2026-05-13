import Link from "next/link";
import { notFound } from "next/navigation";
import { EccMigrationRequiredBanner } from "@/components/admin/email-command-center/EccMigrationRequiredBanner";
import { getContactImportBatchDetail, previewContactImportCommit } from "@/lib/email-command-center/contact-import";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import {
  approveEmailContactImportBatchAction,
  archiveEmailContactImportBatchAction,
  commitEmailContactImportBatchAction,
  validateEmailContactImportBatchAction,
} from "@/app/admin/email-contact-import-actions";

export const dynamic = "force-dynamic";

function asStringArray(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((x): x is string => typeof x === "string");
}

function asTagLine(json: unknown): string {
  if (!Array.isArray(json)) return "—";
  return json.filter((x): x is string => typeof x === "string").join(", ") || "—";
}

type Props = { params: Promise<{ id: string }> };

export default async function EmailContactImportBatchPage({ params }: Props) {
  const { id } = await params;
  const eccSnapshot = await getEmailCommandCenterSnapshot();
  const batch = await getContactImportBatchDetail(id);
  if (!batch) {
    if (eccSnapshot.operatorGate.allEmailCommandCenterMigrationsApplied !== true) {
      return (
        <div className="min-w-0 max-w-3xl space-y-4 px-2 py-4">
          <EccMigrationRequiredBanner
            gate={eccSnapshot.operatorGate}
            context="This import batch cannot be opened until the database schema is current."
          />
          <Link
            href="/admin/workbench/email-command-center/imports"
            className="inline-block rounded border border-kelly-text/15 bg-white px-2 py-1 text-xs font-semibold text-kelly-slate"
          >
            ← Back to imports
          </Link>
        </div>
      );
    }
    notFound();
  }

  const preview = await previewContactImportCommit(id).catch(() => null);

  const canValidate =
    batch.status !== "COMMITTED" &&
    batch.status !== "ARCHIVED" &&
    batch.status !== "FAILED" &&
    batch.status !== "APPROVED";
  const canApprove = batch.status === "VALIDATED" || batch.status === "READY_FOR_APPROVAL";
  const canCommit = batch.status === "APPROVED";
  const canArchive = batch.status !== "ARCHIVED";

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/workbench/email-command-center/imports"
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
        >
          ← All imports
        </Link>
        <Link href="/admin/workbench/email-command-center" className="text-xs text-kelly-text/60 hover:underline">
          Command Center
        </Link>
      </div>

      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">{batch.name}</h1>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          File: <span className="font-mono">{batch.originalFilename}</span>
          {batch.sourceLabel ? (
            <>
              {" "}
              · source: <span className="font-semibold">{batch.sourceLabel}</span>
            </>
          ) : null}{" "}
          · status <span className="font-bold">{batch.status}</span>
        </p>
      </header>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 px-3 py-2 shadow-sm">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Validation summary</h2>
        <dl className="mt-2 grid gap-1 font-body text-[11px] sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-kelly-text/55">Row count</dt>
            <dd className="font-bold tabular-nums">{batch.rowCount}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Valid (incl. existing match)</dt>
            <dd className="font-bold tabular-nums">{batch.validRowCount ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Invalid</dt>
            <dd className="font-bold tabular-nums">{batch.invalidRowCount ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Duplicates (in-batch)</dt>
            <dd className="font-bold tabular-nums">{batch.duplicateRowCount ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Existing profile matches</dt>
            <dd className="font-bold tabular-nums">{batch.existingProfileMatchCount ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Consent warnings (rows)</dt>
            <dd className="font-bold tabular-nums">{batch.consentWarningCount ?? "—"}</dd>
          </div>
        </dl>
        {preview ? (
          <p className="mt-2 font-body text-[11px] text-kelly-text/80">
            Commit preview: would create <span className="font-semibold">{preview.wouldCreateProfiles}</span> profiles,
            update <span className="font-semibold">{preview.wouldUpdateProfiles}</span>, skip{" "}
            <span className="font-semibold">{preview.wouldSkipInvalid}</span> invalid and{" "}
            <span className="font-semibold">{preview.wouldSkipDuplicate}</span> duplicate rows (batch status:{" "}
            {preview.status}).
          </p>
        ) : null}
      </section>

      <section className="flex flex-wrap gap-2">
        {canValidate ? (
          <form action={validateEmailContactImportBatchAction}>
            <input type="hidden" name="batchId" value={batch.id} />
            <button
              type="submit"
              className="rounded border border-kelly-navy/30 bg-white px-3 py-1.5 text-xs font-bold text-kelly-navy"
            >
              Validate
            </button>
          </form>
        ) : null}
        {canApprove ? (
          <form action={approveEmailContactImportBatchAction}>
            <input type="hidden" name="batchId" value={batch.id} />
            <button
              type="submit"
              className="rounded border border-amber-500/40 bg-amber-50/90 px-3 py-1.5 text-xs font-bold text-amber-950"
            >
              Approve batch
            </button>
          </form>
        ) : null}
        {canCommit ? (
          <form action={commitEmailContactImportBatchAction}>
            <input type="hidden" name="batchId" value={batch.id} />
            <button
              type="submit"
              className="rounded border border-emerald-600/40 bg-emerald-50/90 px-3 py-1.5 text-xs font-bold text-emerald-950"
            >
              Commit approved batch
            </button>
          </form>
        ) : null}
        {canArchive ? (
          <form action={archiveEmailContactImportBatchAction}>
            <input type="hidden" name="batchId" value={batch.id} />
            <button
              type="submit"
              className="rounded border border-kelly-text/20 bg-kelly-muted/20 px-3 py-1.5 text-xs font-semibold text-kelly-slate"
            >
              Archive
            </button>
          </form>
        ) : null}
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/40 px-3 py-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Recent decisions</h2>
        <ul className="mt-1 space-y-1 font-body text-[10px] text-kelly-text/85">
          {batch.decisions.length === 0 ? (
            <li className="text-kelly-text/55">None yet.</li>
          ) : (
            batch.decisions.map((d) => (
              <li key={d.id}>
                <span className="font-semibold">{d.decisionType}</span> · {d.reason.slice(0, 160)}
                {d.reason.length > 160 ? "…" : ""}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Row preview</h2>
        <div className="max-h-[480px] overflow-auto rounded-lg border border-kelly-text/12 bg-white/95">
          <table className="min-w-full border-collapse font-body text-[10px]">
            <thead className="sticky top-0 z-10 bg-kelly-page/95">
              <tr className="border-b border-kelly-text/10 text-left font-bold uppercase tracking-wide text-kelly-text/55">
                <th className="px-1.5 py-1">#</th>
                <th className="px-1.5 py-1">Email</th>
                <th className="px-1.5 py-1">Name</th>
                <th className="px-1.5 py-1">County / city</th>
                <th className="px-1.5 py-1">Tags / interests</th>
                <th className="px-1.5 py-1">Status</th>
                <th className="px-1.5 py-1">Matched profile</th>
                <th className="px-1.5 py-1">Notes / validation</th>
              </tr>
            </thead>
            <tbody>
              {batch.rows.map((r) => {
                const msgs = asStringArray(r.validationMessagesJson);
                const displayName = [r.firstName, r.lastName].filter(Boolean).join(" ") || "—";
                const loc = [r.county, r.city].filter(Boolean).join(" / ") || "—";
                const interests = [r.volunteerInterest, r.donorInterest, r.issueInterest].filter(Boolean).join(" · ");
                const tagLine = asTagLine(r.tagsJson);
                const extra = [tagLine !== "—" ? `tags: ${tagLine}` : null, interests ? `interests: ${interests}` : null]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <tr key={r.id} className="border-b border-kelly-text/6 align-top">
                    <td className="px-1.5 py-1 tabular-nums text-kelly-text/60">{r.rowNumber}</td>
                    <td className="px-1.5 py-1 font-mono text-[9px]">{r.normalizedEmail ?? "—"}</td>
                    <td className="px-1.5 py-1">{displayName}</td>
                    <td className="px-1.5 py-1">{loc}</td>
                    <td className="px-1.5 py-1">{extra || "—"}</td>
                    <td className="px-1.5 py-1 font-semibold">{r.validationStatus}</td>
                    <td className="px-1.5 py-1">
                      {r.matchedProfile?.primaryEmail ? (
                        <span className="font-mono text-[9px]">{r.matchedProfile.primaryEmail}</span>
                      ) : r.matchedProfileId ? (
                        <span className="font-mono text-[9px]">{r.matchedProfileId}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-1.5 py-1 text-kelly-text/80">
                      {r.notes ? <span className="block">{r.notes}</span> : null}
                      {msgs.length ? (
                        <ul className="mt-0.5 list-inside list-disc">
                          {msgs.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
