import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { pageMeta } from "@/lib/seo/metadata";
import { listPublicEditorialMerged } from "@/lib/content/public-catalog";
import { publishedMediaSince2025_11, publishedMediaEarlier } from "@/content/editorial/external-media";
import { EditorialMediaArchive } from "@/components/editorial/EditorialMediaArchive";

export const metadata: Metadata = pageMeta({
  title: "Editorial",
  description:
    "Columns and commentary: Kelly’s bylined work in Arkansas papers, plus longer sample essays on this site about democracy and civic life.",
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
        subtitle="Up first: bylined work that ran in Arkansas’s newspapers, with links to the full text. Below that are longer sample essays published only on this site—draft copy to exercise layout and tone, not reprints of the paper columns."
      />

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <EditorialMediaArchive
            sinceNov2025={publishedMediaSince2025_11}
            earlier={publishedMediaEarlier}
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer wide>
          <h2 className="font-heading text-xl font-bold text-deep-soil">Sample essays (this site only)</h2>
          <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-deep-soil/75">
            These pages live at <code className="rounded bg-deep-soil/5 px-1.5 text-xs">/editorial/…</code> and are
            marked as sample campaign copy. They are not syndicated from the Democrat-Gazette or other newsrooms.
          </p>
          <h3 className="mt-10 font-heading text-lg font-bold text-deep-soil">Featured (sample)</h3>
          <ul className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {featured.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/editorial/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-amber-700/20 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-amber-700/40"
                >
                  <p className="order-first bg-amber-100/90 px-4 py-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-amber-950/90">
                    Sample copy · on-site only
                  </p>
                  <ContentImage media={p.image} className="aspect-[16/9] max-h-[280px]" warmOverlay />
                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <p className="font-body text-xs font-bold uppercase tracking-wider text-civic-slate">{p.category}</p>
                    <h3 className="mt-3 font-heading text-2xl font-bold text-deep-soil group-hover:text-red-dirt lg:text-3xl">
                      {p.title}
                    </h3>
                    <p className="mt-4 flex-1 font-body text-base leading-relaxed text-deep-soil/75">{p.summary}</p>
                    <span className="mt-6 font-body text-sm font-semibold text-red-dirt">Read sample essay →</span>
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
            More sample essays
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {rest.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/editorial/${p.slug}`}
                  className="flex gap-6 rounded-card border border-amber-700/20 bg-cream-canvas p-5 shadow-[var(--shadow-soft)] transition hover:border-amber-700/35 md:p-6"
                >
                  <div className="relative hidden w-36 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                    <ContentImage media={p.image} className="h-full min-h-[120px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-[9px] font-bold uppercase tracking-wider text-amber-900/80">Sample</p>
                    <p className="mt-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-deep-soil/50">{p.category}</p>
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

