import Link from "next/link";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadPackoFinanceScaffold } from "@/lib/intelligence/opponents/loadMichaelPackoQuotes";
import { PACKO_COMMAND_CENTER_ROUTES } from "@/lib/intelligence/opponents/packoCommandCenterRoutes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MichaelPackoFinancePage() {
  const finance = loadPackoFinanceScaffold();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="PACKO-01 · finance & filings"
        title="Ballot qualification & campaign finance"
        description="No dollar amounts on stage until ethics/SOS filings are logged with source URLs. Partial summary below is narrative-only from public sources."
      >
        <V4BackLinks />
        <Link
          href={PACKO_COMMAND_CENTER_ROUTES.hub}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Pakko command center
        </Link>
      </V4PageHeader>

      <article className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50/30 p-5 text-sm">
        <p className="font-bold uppercase text-amber-950">Status: {finance.status}</p>
        <p className="mt-2 text-kelly-muted">{finance.notes}</p>
        <p className="mt-3 text-xs font-bold text-rose-900">{finance.claimsGate}</p>
      </article>

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-bold uppercase text-kelly-navy">Summary slots</h2>
        <dl className="mt-4 space-y-3 text-xs">
          {Object.entries(finance.summarySlots).map(([key, value]) => (
            <div key={key} className="grid gap-1 border-b border-kelly-text/5 pb-2 sm:grid-cols-[180px_1fr]">
              <dt className="font-bold uppercase text-kelly-subtle">{key.replace(/([A-Z])/g, " $1")}</dt>
              <dd className="text-kelly-text">{value ?? "— pending staff review —"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-bold uppercase text-kelly-navy">Filing sources to search</h2>
        <ul className="mt-3 space-y-2 text-xs">
          {finance.sources.map((s) => (
            <li key={s.url} className="flex flex-wrap gap-2">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-bold text-kelly-navy underline">
                {s.label}
              </a>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">{s.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
