import Link from "next/link";

import { ElectionPlanDrillDownShell } from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_DEBATE_PREP_HREF,
  epDebatePrepDayHref,
  epOpponentBioHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  getOpponentBioHubLinks,
  listOpponentBios,
  OPPONENT_BIO_HUB,
} from "@/lib/election-plan/opponentBioDrillDown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Opponent biographies | Debate prep",
  robots: { index: false, follow: false },
};

export default function OpponentBiosHubPage() {
  const bios = listOpponentBios();

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_DEBATE_PREP_HREF}
      backLabel="Debate prep hub"
      eyebrow="Command prep · opponent intelligence"
      title={OPPONENT_BIO_HUB.title}
      description={OPPONENT_BIO_HUB.description}
    >
      <article className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-violet-950">Three-read cadence</h2>
        <div className="mt-4 space-y-4">
          {OPPONENT_BIO_HUB.readingCadence.map((item) => (
            <div key={item.day} className="border-l-4 border-violet-400 pl-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <Link
                  href={epDebatePrepDayHref(item.dayId)}
                  className="font-heading text-base font-bold text-[var(--ep-navy)] underline"
                >
                  {item.label}
                </Link>
              </div>
              <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </article>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {bios.map((bio) => (
          <Link
            key={bio.opponentId}
            href={epOpponentBioHref(bio.opponentId)}
            className="ep-card flex min-h-[200px] flex-col p-5 transition hover:border-[var(--ep-navy)]/40"
          >
            <p className="text-xs font-bold uppercase text-rose-900">{bio.partyLabel}</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{bio.displayName}</h2>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{bio.subtitle}</p>
            <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
              {bio.professorLead}
            </p>
            <p className="mt-4 text-xs font-bold text-[var(--ep-gold)]">
              Full biography · {bio.dossierSections.length} dossier sections →
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Related prep</h2>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {getOpponentBioHubLinks().map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[var(--ep-border)] px-3 py-1.5 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </ElectionPlanDrillDownShell>
  );
}
