import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  EP_DEBATE_PREP_HREF,
  epLegislativeIntel2021Href,
  epLegislativeIntel2025Href,
} from "@/lib/election-plan/debate-prep-links";
import { listLegislativeIntelPages } from "@/lib/election-plan/legislative-intel-drill-down";

export const metadata = {
  title: "Legislative intelligence | Debate Prep",
  robots: { index: false, follow: false },
};

export default function LegislativeIntelHubPage() {
  const pages = listLegislativeIntelPages();

  return (
    <>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav compact />
          <header className="mb-6">
            <Link href={EP_DEBATE_PREP_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
              ← Debate prep
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">Hammer&apos;s election bills</h1>
          </header>

          <KellyPageSummary
            summary="Two packages matter for debate: his 2021 integrity architecture and his 2025 petition restrictions. Know the pattern — agree on security, pivot to county implementation and Arkansas direct democracy."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {pages.map((page) => {
              const href = page.id === "2021-integrity" ? epLegislativeIntel2021Href() : epLegislativeIntel2025Href();
              return (
                <Link key={page.id} href={href} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
                  <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">{page.subtitle}</p>
                  <h2 className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{page.title}</h2>
                  <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{page.pageSummary}</p>
                  <p className="mt-4 text-xs font-bold text-[var(--ep-navy)]">Open study guide →</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
