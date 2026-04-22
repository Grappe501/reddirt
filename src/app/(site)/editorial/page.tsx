import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { pageMeta } from "@/lib/seo/metadata";
import { listPublicEditorialMerged } from "@/lib/content/public-catalog";

export const metadata: Metadata = pageMeta({
  title: "Editorial",
  description:
    "Longer essays on democracy, transparency, and Arkansas civic life—focused on what the Secretary of State’s office touches.",
  path: "/editorial",
  imageSrc: "/media/placeholders/editorial-ink-field.svg",
});

export default async function EditorialIndexPage() {
  const all = await listPublicEditorialMerged();
  const featured = all.filter((p) => p.featured);
  const rest = all.filter((p) => !p.featured);

  return (
    <>
      <PageHero
        tone="plan"
        eyebrow="Essays"
        title="Editorial"
        subtitle="This is where we slow down—enough to admit complexity, enough to refuse cynicism. No jargon trophies. Just Arkansas-grounded reasoning you can argue with at a kitchen table."
      />

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <h2 className="font-heading text-xl font-bold text-deep-soil">Featured</h2>
          <ul className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {featured.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/editorial/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-red-dirt/30"
                >
                  <ContentImage media={p.image} className="aspect-[16/9] max-h-[280px]" warmOverlay />
                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <p className="font-body text-xs font-bold uppercase tracking-wider text-civic-slate">{p.category}</p>
                    <h3 className="mt-3 font-heading text-2xl font-bold text-deep-soil group-hover:text-red-dirt lg:text-3xl">
                      {p.title}
                    </h3>
                    <p className="mt-4 flex-1 font-body text-base leading-relaxed text-deep-soil/75">{p.summary}</p>
                    <span className="mt-6 font-body text-sm font-semibold text-red-dirt">
                      Read essay →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="more-editorial-heading">
        <ContentContainer wide>
          <h2 id="more-editorial-heading" className="font-heading text-xl font-bold text-deep-soil">
            More essays
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {rest.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/editorial/${p.slug}`}
                  className="flex gap-6 rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)] transition hover:border-red-dirt/25 md:p-6"
                >
                  <div className="relative hidden w-36 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                    <ContentImage media={p.image} className="h-full min-h-[120px]" />
                  </div>
                  <div>
                    <p className="font-body text-[11px] font-bold uppercase tracking-wider text-deep-soil/50">{p.category}</p>
                    <h3 className="mt-2 font-heading text-lg font-bold text-deep-soil">{p.title}</h3>
                    <p className="mt-2 font-body text-sm text-deep-soil/75 line-clamp-3">{p.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}

