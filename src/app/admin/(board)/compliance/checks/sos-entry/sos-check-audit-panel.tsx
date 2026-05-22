import Link from "next/link";
import type { AprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-workbook.shared";
import { getAprilCheckSosWorkbookStats, getEntryMissingRequired } from "@/lib/compliance/checks/april-check-sos-workbook.shared";

export function SosCheckAuditPanel({ workbook }: { workbook: AprilCheckSosWorkbook }) {
  const stats = getAprilCheckSosWorkbookStats(workbook);
  const missingCount = workbook.entries.filter((e) => getEntryMissingRequired(e).length > 0).length;
  const donationImages = workbook.sourceImages.filter((i) => i.imageCategory === "donation_folder");
  const expectedMinChecks = donationImages.length * 2;
  const lowExtractWarning = stats.totalChecks > 0 && stats.totalChecks < expectedMinChecks;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-[#0f2744]">Audit spreadsheet integration</h2>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Physical checks on board</dt>
          <dd className="font-mono font-bold">{stats.totalChecks}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Missing required fields</dt>
          <dd className="font-mono font-bold">{missingCount}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Ready for SOS copy</dt>
          <dd className="font-mono font-bold">{stats.readyForSos}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Donation photos</dt>
          <dd className="font-mono font-bold">{stats.donationFolderImages}</dd>
        </div>
      </dl>
      {lowExtractWarning ? (
        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          Fewer checks listed ({stats.totalChecks}) than you might expect from {donationImages.length} photos. Re-run
          &quot;Extract all checks on photo&quot; or use <strong>Add blank physical check row</strong> if vision missed a check.
        </p>
      ) : null}
      <p className="mt-3 text-sm text-slate-700">
        <strong>Next:</strong> Review each row, then regenerate the April audit spreadsheet so checks appear in the master
        CSV.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="/api/admin/compliance/audit-spreadsheet?file=docs/compliance/audit/april-2026-checks.csv"
          className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold text-[#0f2744]"
        >
          Download checks audit CSV
        </a>
        <Link href="/admin/compliance/ernie" className="rounded-full bg-[#0f2744] px-4 py-2 text-sm font-bold text-white">
          Ernie workflow
        </Link>
      </div>
    </section>
  );
}
