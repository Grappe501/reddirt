import Link from "next/link";
import { PackoContrastGateBanner } from "@/components/admin/intelligence/PackoContrastGateBanner";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadMichaelPackoQuotes } from "@/lib/intelligence/opponents/loadMichaelPackoQuotes";
import { PACKO_COMMAND_CENTER_ROUTES } from "@/lib/intelligence/opponents/packoCommandCenterRoutes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MichaelPackoQuotesPage() {
  const { quotes } = loadMichaelPackoQuotes();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="PACKO-02 · quote ledger"
        title="Michael Pakko — sourced public statements"
        description="Every line on stage must trace to a URL here. Paraphrase only when paraphraseAllowed is true. Kelly response frames are rehearsal guidance — verify claims gate before broadcast."
      >
        <V4BackLinks />
        <Link
          href={PACKO_COMMAND_CENTER_ROUTES.hub}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Pakko command center
        </Link>
      </V4PageHeader>

      <PackoContrastGateBanner compact />

      <div className="space-y-4">
        {quotes.map((q) => (
          <article key={q.id} className="rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-kelly-navy">{q.id}</span>
              <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-900">
                {q.evidenceStatus}
              </span>
              <span className="text-[10px] uppercase text-kelly-subtle">{q.topic.replace(/_/g, " ")}</span>
            </div>
            <blockquote className="mt-3 border-l-4 border-amber-300 pl-4 italic text-kelly-text">
              &ldquo;{q.quoteText}&rdquo;
            </blockquote>
            {q.kellyResponseFrame ? (
              <p className="mt-3 rounded-lg bg-emerald-50/60 p-3 text-xs text-emerald-950">
                <span className="font-bold uppercase">Kelly frame: </span>
                {q.kellyResponseFrame}
              </p>
            ) : null}
            {q.doNotMisquote ? (
              <p className="mt-2 text-xs font-bold text-rose-900">Do not misquote: {q.doNotMisquote}</p>
            ) : null}
            <ul className="mt-3 space-y-1 text-xs">
              {q.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-kelly-navy underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
