import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { listPublishedCounties } from "@/lib/county/get-county-command-data";
import { getVoterRegistrationCenterHref } from "@/lib/county/official-links";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "County command",
  description:
    "County-level campaign intelligence: who is leading, what is happening, and what you can do—organized for Arkansas’s field program.",
};

export default async function CountiesIndexPage() {
  const rows = await listPublishedCounties();

  return (
    <>
      <PageHero
        eyebrow="Arkansas field"
        title="County command pages"
        subtitle="Pick a county for registration goals, field metrics, and local ways to help—grounded in trusted public data and campaign-run organizing tools."
      />
      <FullBleedSection className="border-b border-deep-soil/10 py-6">
        <ContentContainer>
          <p className="text-sm text-deep-soil/80">
            <Link className="font-semibold text-red-dirt underline-offset-2 hover:underline" href={getVoterRegistrationCenterHref()}>
              Voter registration center
            </Link>{" "}
            — help, official lookup handoff, and how we count new registrations.
          </p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer>
          {rows.length === 0 ? (
            <p className="text-deep-soil/75">No counties are published yet. Check back soon.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/counties/${c.slug}`}
                    className="block rounded-2xl border border-deep-soil/10 bg-cream-canvas p-5 shadow-sm transition hover:border-red-dirt/30 hover:shadow-elevated"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/90">
                      {c.regionLabel ?? "Arkansas"}
                    </p>
                    <h2 className="mt-1 font-heading text-xl font-bold text-deep-soil">{c.displayName}</h2>
                    {c.campaignStats?.volunteerCount != null ? (
                      <p className="mt-2 text-sm text-deep-soil/60">
                        Field volunteers (approx.): {c.campaignStats.volunteerCount}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-deep-soil/60">Open command page for goals and next steps</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
