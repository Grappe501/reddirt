import Link from "next/link";
import { EccOperatorPageChrome } from "@/components/admin/email-command-center/ecc-operator-ux";
import { listContactImportBatches } from "@/lib/email-command-center/contact-import";
import { uploadEmailContactImportCsvAction } from "@/app/admin/email-contact-import-actions";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function EmailContactImportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const err = typeof sp.error === "string" ? sp.error : undefined;

  const [eccSnapshot, batches] = await Promise.all([
    getEmailCommandCenterSnapshot(),
    listContactImportBatches(40).catch((): Awaited<ReturnType<typeof listContactImportBatches>> => []),
  ]);

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <EccOperatorPageChrome snapshot={eccSnapshot} surface="imports" />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/workbench/email-command-center"
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
        >
          ← Communication Command Center
        </Link>
        <Link href="/admin/workbench/email-command-center/profiles" className="text-xs text-kelly-muted hover:underline">
          Profile review
        </Link>
        <Link href="/admin/workbench/email-command-center/audiences" className="text-xs text-kelly-muted hover:underline">
          Audience Studio
        </Link>
        <Link
          href="/admin/workbench/email-command-center/message-studio"
          className="text-xs font-semibold text-kelly-forest hover:underline"
        >
          Message Studio
        </Link>
        <Link href="/admin/workbench/email-command-center/analytics" className="text-xs text-kelly-muted hover:underline">
          Analytics
        </Link>
      </div>

      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">Contact import staging</h1>
        <p className="mt-1 max-w-3xl font-body text-sm text-kelly-text/85">
          EMAIL-CONTACT-IMPORT-STAGING-1.0 — upload CSVs for <strong>staging only</strong>. Validate, dedupe within batch,
          match existing <code className="text-[10px]">EmailContactProfile</code>, preview, then operator{" "}
          <strong>approve</strong> and <strong>commit</strong> to create or update profiles and{" "}
          <code className="text-[10px]">EmailContactProfileFact</code> rows with <code className="text-[10px]">CONTACT_IMPORT</code>{" "}
          provenance. No SendGrid sync, no sends, no OpenAI enrichment on this path. For <strong>production</strong> contact
          commits, verify the <strong>canonical hosted</strong> database and operator import gate docs first — staging on the wrong DB
          is unsafe even though this UI does not send mail.
        </p>
      </header>

      {err === "file" ? (
        <p className="rounded border border-rose-300/60 bg-rose-50/90 px-3 py-2 font-body text-xs text-rose-950" role="alert">
          Choose a non-empty CSV file before uploading.
        </p>
      ) : null}
      {err === "size" ? (
        <p className="rounded border border-rose-300/60 bg-rose-50/90 px-3 py-2 font-body text-xs text-rose-950" role="alert">
          File too large for this upload path (limit 2MB text). Split the list or ask for a streaming import packet.
        </p>
      ) : null}

      <section className="rounded-lg border border-rose-300/50 bg-rose-50/80 px-3 py-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-rose-950">Governance</h2>
        <ul className="mt-1 list-inside list-disc font-body text-[11px] text-rose-950/95">
          <li>No email sends from import — ever.</li>
          <li>No SendGrid contact or audience sync from import.</li>
          <li>Importing a contact is not send consent; sourceList + consentStatus are warnings until operators govern future sends.</li>
          <li>Commit runs only after explicit batch approval and remains auditable via import decisions + fact metadata.</li>
          <li>
            Imported contacts are <strong>not</strong> automatically messaged. After approval, use{" "}
            <Link href="/admin/workbench/email-command-center/audiences" className="font-bold underline">
              Audience Studio
            </Link>{" "}
            +{" "}
            <Link href="/admin/workbench/email-command-center/message-studio" className="font-bold underline">
              Message Studio
            </Link>{" "}
            to plan governed outreach — still no send from those surfaces tonight.
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-text/15 bg-white/95 px-3 py-3 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Upload CSV</h2>
        <p className="mt-1 font-body text-xs text-kelly-text/80">
          <span className="font-semibold">Required:</span> column <code className="text-[10px]">email</code> (or{" "}
          <code className="text-[10px]">e-mail</code>). <span className="font-semibold">Recommended:</span>{" "}
          <code className="text-[10px]">sourceList</code>, <code className="text-[10px]">consentStatus</code>, first/last
          name, county, city, tags, organization, role, interests.
        </p>
        <form action={uploadEmailContactImportCsvAction} encType="multipart/form-data" className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className="block min-w-[200px] flex-1 font-body text-[11px] text-kelly-text/80">
              Batch name
              <input
                name="name"
                type="text"
                className="mt-0.5 w-full rounded border border-kelly-text/20 px-2 py-1 text-xs"
                placeholder="e.g. County fair signups May 2026"
              />
            </label>
            <label className="block min-w-[200px] flex-1 font-body text-[11px] text-kelly-text/80">
              Source label (optional)
              <input
                name="sourceLabel"
                type="text"
                className="mt-0.5 w-full rounded border border-kelly-text/20 px-2 py-1 text-xs"
                placeholder="e.g. booth_scan_qr"
              />
            </label>
          </div>
          <label className="block font-body text-[11px] text-kelly-text/80">
            CSV file
            <input name="file" type="file" accept=".csv,text/csv" className="mt-0.5 block text-xs" required />
          </label>
          <button
            type="submit"
            className="rounded border border-kelly-forest/40 bg-kelly-fog/70 px-3 py-1.5 text-xs font-bold text-kelly-navy"
          >
            Upload &amp; open batch
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Import batches</h2>
        <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white/95">
          <table className="min-w-full border-collapse font-body text-[11px]">
            <thead>
              <tr className="border-b border-kelly-text/10 bg-kelly-page/80 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                <th className="px-2 py-1.5">Name</th>
                <th className="px-2 py-1.5">Status</th>
                <th className="px-2 py-1.5">Rows</th>
                <th className="px-2 py-1.5">Valid</th>
                <th className="px-2 py-1.5">Invalid</th>
                <th className="px-2 py-1.5">Dupes</th>
                <th className="px-2 py-1.5">Existing</th>
                <th className="px-2 py-1.5">Consent Σ</th>
                <th className="px-2 py-1.5">Created</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-2 py-3">
                    <div className="rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-2 text-left font-body text-[11px] text-kelly-navy" role="status">
                      <p className="font-semibold">No import batches yet</p>
                      <p className="mt-1 text-[10px] text-kelly-text/80">
                        Upload a small test CSV (fake emails only) after{" "}
                        <code className="text-[9px]">npm run email:contact-import:gate</code> succeeds on this database.
                      </p>
                      <p className="mt-1 text-[10px]">
                        <Link href="/admin/workbench/email-command-center/readiness" className="font-bold text-kelly-forest underline">
                          Readiness checklist
                        </Link>{" "}
                        ·{" "}
                        <Link href="/admin/workbench/email-command-center/profiles" className="font-bold text-kelly-forest underline">
                          Profile review
                        </Link>
                      </p>
                      <p className="mt-1 text-[10px] text-kelly-forest/90">
                        <strong>Safety:</strong> no sends, no SendGrid sync — commit writes profiles + CONTACT_IMPORT facts only.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.id} className="border-b border-kelly-text/8">
                    <td className="px-2 py-1.5">
                      <Link href={`/admin/workbench/email-command-center/imports/${b.id}`} className="font-semibold text-kelly-navy underline">
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-2 py-1.5">{b.status}</td>
                    <td className="px-2 py-1.5 tabular-nums">{b.rowCount}</td>
                    <td className="px-2 py-1.5 tabular-nums">{b.validRowCount ?? "—"}</td>
                    <td className="px-2 py-1.5 tabular-nums">{b.invalidRowCount ?? "—"}</td>
                    <td className="px-2 py-1.5 tabular-nums">{b.duplicateRowCount ?? "—"}</td>
                    <td className="px-2 py-1.5 tabular-nums">{b.existingProfileMatchCount ?? "—"}</td>
                    <td className="px-2 py-1.5 tabular-nums">{b.consentWarningCount ?? "—"}</td>
                    <td className="px-2 py-1.5 text-kelly-muted">{b.createdAt.toISOString().slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
