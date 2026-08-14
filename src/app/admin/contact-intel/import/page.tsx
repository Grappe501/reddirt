import Link from "next/link";
import { uploadContactIntelFileAction } from "@/app/admin/contact-intel-actions";
import { listContactIntelJobs } from "@/lib/contact-intel/queries";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function ContactIntelImportIndexPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const jobs = await listContactIntelJobs(50);

  return (
    <div className="space-y-6">
      {error === "file" ? <Banner>Choose a CSV or XLSX file.</Banner> : null}
      {error === "size" ? <Banner>File is larger than 8MB. Split it and retry.</Banner> : null}
      {error === "ext" ? <Banner>Only .csv, .xlsx, and .xls files are accepted.</Banner> : null}
      {error === "headers" ? <Banner>No header row found. Put column names on the first row.</Banner> : null}
      {error === "dupheaders" ? <Banner>Duplicate column headers are not allowed. Rename them and retry.</Banner> : null}
      {error === "rows" ? <Banner>No data rows found, or the file has more than 20,000 data rows.</Banner> : null}
      {error === "parse" ? <Banner>Could not read headers or rows from that file.</Banner> : null}
      {error === "job" ? <Banner>That import job could not be found.</Banner> : null}

      <section className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Upload spreadsheet</h2>
        <p className="mt-1 text-sm text-kelly-text/80">
          CSV or first-sheet XLSX, 8MB and 20,000 data rows max. Map columns on the next screen. Extra
          columns are kept as source data and ignored until you map them. Do not upload a real contact
          file into an unintended environment.
        </p>
        <form action={uploadContactIntelFileAction} className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-kelly-text/80">
            Source label (optional)
            <input
              name="sourceLabel"
              className="mt-1 w-full rounded border border-kelly-text/20 px-2 py-1.5 text-sm"
              placeholder="e.g. 2024 county fair sheet"
            />
          </label>
          <label className="block text-xs font-semibold text-kelly-text/80">
            File
            <input name="file" type="file" accept=".csv,.xlsx,.xls,text/csv" required className="mt-1 block text-sm" />
          </label>
          <button type="submit" className="rounded border border-kelly-forest/40 bg-kelly-fog/80 px-3 py-2 text-sm font-bold text-kelly-navy">
            Upload and map
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg font-bold text-kelly-navy">Import jobs</h2>
        <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white/95">
          <table className="min-w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-kelly-text/10 bg-kelly-page/80 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Rows</th>
                <th className="px-3 py-2">Conflicts</th>
                <th className="px-3 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-5 text-sm text-kelly-muted">
                    No imports yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-b border-kelly-text/8">
                    <td className="px-3 py-2">
                      <Link className="font-semibold text-kelly-navy underline" href={`/admin/contact-intel/import/${job.id}`}>
                        {job.originalFilename}
                      </Link>
                      {job.sourceLabel ? <div className="text-[11px] text-kelly-muted">{job.sourceLabel}</div> : null}
                    </td>
                    <td className="px-3 py-2">{job.status}</td>
                    <td className="px-3 py-2">{job._count.rows}</td>
                    <td className="px-3 py-2">{job._count.conflicts}</td>
                    <td className="px-3 py-2 text-kelly-muted">{job.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
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

function Banner({ children }: { children: string }) {
  return <p className="rounded border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-950">{children}</p>;
}
