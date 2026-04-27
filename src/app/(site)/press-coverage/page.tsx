import type { Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PressCoverageThirdPartyResources } from "@/components/press/PressCoverageThirdPartyResources";
import { getPressCoverageCuratedOnly, getPressCoverageFeed } from "@/lib/media-monitor/press-coverage-feed";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Press coverage",
  description:
    "Earned media, curated press links, and third-party election guides and results pages for the Arkansas Secretary of State race — all in one place under News.",
  path: "/press-coverage",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function PressCoveragePage() {
  let mentions: Awaited<ReturnType<typeof getPressCoverageFeed>> = [];
  let listUnavailableMessage: string | null = null;

  try {
    mentions = await getPressCoverageFeed(80);
  } catch (err) {
    if (!isPrismaDatabaseUnavailable(err)) throw err;
    logPrismaDatabaseUnavailable("press-coverage/getPressCoverageFeed", err);
    mentions = getPressCoverageCuratedOnly(80);
    listUnavailableMessage =
      "Hand-picked coverage below still appears. Some live listings could not be loaded—try again later, or follow From the Road for the latest.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-kelly-fog/90 via-white to-kelly-fog/50 pb-16 pt-10 md:pb-24 md:pt-14">
      <ContentContainer>
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-kelly-gold">News · Earned media</p>
          <h1 className="mt-4 font-heading text-[clamp(1.95rem,4.2vw,3rem)] font-bold tracking-tight text-kelly-ink">
            Press coverage
          </h1>
          <p className="mt-6 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">
            Earned-media clips from Arkansas outlets (selected by our communications team), curated newspaper links, and
            third-party election guides below. We respect outlet terms and link to originals rather than reproducing
            paywalled text.
          </p>
          <p className="mt-4 font-body text-sm text-kelly-slate/85">
            Monitoring runs on a weekly cadence. For questions about a listing, contact the campaign press team.
          </p>
          {listUnavailableMessage ? (
            <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-left font-body text-sm leading-relaxed text-amber-950/90">
              <strong className="font-bold">Listings temporarily unavailable.</strong> {listUnavailableMessage}
            </p>
          ) : null}
        </header>

        <ul className="mx-auto mt-12 max-w-3xl space-y-6">
          {mentions.length === 0 && !listUnavailableMessage ? (
            <li className="rounded-card border border-kelly-text/10 bg-white/90 p-6 text-center font-body text-kelly-slate">
              Approved press clips will appear here after the next ingest and staff review.{" "}
              <Link href="/from-the-road" className="text-kelly-slate underline">
                From the Road
              </Link>{" "}
              always has campaign-authored updates.
            </li>
          ) : null}
          {mentions.length > 0
            ? (
              mentions.map((m) => (
                <li
                  key={m.id}
                  className="rounded-card border border-kelly-text/10 bg-white/90 p-5 shadow-[var(--shadow-card)]"
                >
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-gold">
                    {m.outletName}
                    {m.sourceRegion ? ` · ${m.sourceRegion}` : ""}
                    {m.publishedAt ? ` · ${m.publishedAt.toLocaleDateString("en-US", { timeZone: "America/Chicago" })}` : ""}
                  </p>
                  <h2 className="mt-2 font-heading text-xl font-bold text-kelly-ink">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="hover:text-kelly-navy">
                      {m.title}
                    </a>
                  </h2>
                  {m.summary ? (
                    <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{m.summary}</p>
                  ) : null}
                  {m.campaignSummary ? (
                    <p className="mt-3 border-l-2 border-kelly-gold/60 pl-3 font-body text-sm italic text-kelly-slate/90">
                      {m.campaignSummary}
                    </p>
                  ) : null}
                  {m.additionalLinks && m.additionalLinks.length > 0 ? (
                    <div className="mt-3">
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/70">
                        Also published as
                      </p>
                      <ul className="mt-1.5 list-none space-y-1 p-0">
                        {m.additionalLinks.map((l) => (
                          <li key={l.href}>
                            <a
                              href={l.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-body text-sm text-kelly-slate underline-offset-2 hover:text-kelly-navy hover:underline"
                            >
                              {l.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-kelly-slate/75">
                    {m.isEditorial ? (
                      <span className="rounded-full bg-kelly-fog/80 px-2 py-0.5">Editorial</span>
                    ) : null}
                    {m.isOpinion ? (
                      <span className="rounded-full bg-kelly-fog/80 px-2 py-0.5">Opinion</span>
                    ) : null}
                    {m.isTvWebStory ? (
                      <span className="rounded-full bg-kelly-fog/80 px-2 py-0.5">TV / video</span>
                    ) : null}
                    {m.relatedCountyDisplayName ? (
                      <span className="rounded-full bg-kelly-fog/80 px-2 py-0.5">{m.relatedCountyDisplayName}</span>
                    ) : null}
                  </div>
                </li>
              ))
            )
            : null}
        </ul>

        <PressCoverageThirdPartyResources />
      </ContentContainer>
    </div>
  );
}
