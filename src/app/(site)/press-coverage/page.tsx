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
      "Staff-curated clips below are still shown. Approved monitor items from the database could not be loaded — start Postgres (docker-compose, port 5433) or fix DATABASE_URL to merge those listings. Campaign updates are on From the Road.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-civic-fog/90 via-white to-civic-fog/50 pb-16 pt-10 md:pb-24 md:pt-14">
      <ContentContainer>
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-civic-gold">News · Earned media</p>
          <h1 className="mt-4 font-heading text-[clamp(1.95rem,4.2vw,3rem)] font-bold tracking-tight text-civic-ink">
            Press coverage
          </h1>
          <p className="mt-6 font-body text-lg leading-relaxed text-civic-slate md:text-xl">
            Earned-media clips from Arkansas outlets (staff-approved from our monitor), curated newspaper links, and
            third-party election guides below. We respect outlet terms and link to originals rather than reproducing
            paywalled text.
          </p>
          <p className="mt-4 font-body text-sm text-civic-slate/85">
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
            <li className="rounded-card border border-deep-soil/10 bg-white/90 p-6 text-center font-body text-civic-slate">
              Approved press clips will appear here after the next ingest and staff review.{" "}
              <Link href="/from-the-road" className="text-civic-slate underline">
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
                  className="rounded-card border border-deep-soil/10 bg-white/90 p-5 shadow-[var(--shadow-card)]"
                >
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-civic-gold">
                    {m.outletName}
                    {m.sourceRegion ? ` · ${m.sourceRegion}` : ""}
                    {m.publishedAt ? ` · ${m.publishedAt.toLocaleDateString("en-US", { timeZone: "America/Chicago" })}` : ""}
                  </p>
                  <h2 className="mt-2 font-heading text-xl font-bold text-civic-ink">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-dirt">
                      {m.title}
                    </a>
                  </h2>
                  {m.summary ? (
                    <p className="mt-3 font-body text-sm leading-relaxed text-civic-slate">{m.summary}</p>
                  ) : null}
                  {m.campaignSummary ? (
                    <p className="mt-3 border-l-2 border-civic-gold/60 pl-3 font-body text-sm italic text-civic-slate/90">
                      {m.campaignSummary}
                    </p>
                  ) : null}
                  {m.additionalLinks && m.additionalLinks.length > 0 ? (
                    <div className="mt-3">
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-civic-slate/70">
                        Also published as
                      </p>
                      <ul className="mt-1.5 list-none space-y-1 p-0">
                        {m.additionalLinks.map((l) => (
                          <li key={l.href}>
                            <a
                              href={l.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-body text-sm text-civic-slate underline-offset-2 hover:text-red-dirt hover:underline"
                            >
                              {l.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-civic-slate/75">
                    {m.isEditorial ? (
                      <span className="rounded-full bg-civic-fog/80 px-2 py-0.5">Editorial</span>
                    ) : null}
                    {m.isOpinion ? (
                      <span className="rounded-full bg-civic-fog/80 px-2 py-0.5">Opinion</span>
                    ) : null}
                    {m.isTvWebStory ? (
                      <span className="rounded-full bg-civic-fog/80 px-2 py-0.5">TV / video</span>
                    ) : null}
                    {m.relatedCountyDisplayName ? (
                      <span className="rounded-full bg-civic-fog/80 px-2 py-0.5">{m.relatedCountyDisplayName}</span>
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
