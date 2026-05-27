import Link from "next/link";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerThemesPage() {
  const data = loadKimHammerWorkbench();
  const kh2 = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Theme Pattern Analyzer</p>
        <h1 className="font-heading text-2xl font-bold">Theme Pages</h1>
      </header>

      <section className="grid gap-4">
        {Object.entries(data.themes).map(([theme, billIds]) => (
          <div key={theme} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{theme.replaceAll("_", " ")}</h2>
            <p className="mt-1 text-xs text-kelly-muted">Bills in theme: {billIds.length}</p>
            <p className="mt-1 text-xs text-kelly-muted">Risk level: {billIds.length >= 4 ? "HIGH" : billIds.length > 0 ? "MEDIUM" : "LOW"}</p>
            <p className="mt-1 text-xs text-kelly-muted">Debate use: Build one sourced contrast question per top bill.</p>
            <p className="mt-1 text-xs text-kelly-muted">Research gaps: Pull act text + implementation evidence for county impact.</p>
            <p className="mt-1 text-xs text-kelly-muted">
              Contrast implication: {kh2.websiteMessageIndex.contrastImplications[0]?.pattern ?? "NEEDS_REVIEW"}.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {billIds.map((billId) => (
                <Link
                  key={billId}
                  href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(billId)}`}
                  className="rounded border px-2 py-0.5 text-[11px] font-semibold text-kelly-navy"
                >
                  {billId}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

