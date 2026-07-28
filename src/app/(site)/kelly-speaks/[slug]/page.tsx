import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { CampaignShortCard } from "@/components/media/CampaignShortCard";
import { CampaignVideoCard } from "@/components/media/CampaignVideoCard";
import { CampaignVideoStructuredData } from "@/components/seo/CampaignVideoStructuredData";
import {
  getPublishedCampaignMediaBySlug,
  listPublishedCampaignMedia,
} from "@/content/media/campaign-media-registry";
import { siteConfig } from "@/config/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listPublishedCampaignMedia().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const media = getPublishedCampaignMediaBySlug(slug);
  if (!media) return { title: "Video not found" };
  const url = `${siteConfig.url}/kelly-speaks/${media.slug}`;
  return {
    title: `${media.title} | Kelly Speaks | ${siteConfig.name}`,
    description: media.summary ?? media.description,
    alternates: { canonical: url },
    openGraph: {
      title: media.title,
      description: media.summary ?? media.description,
      url,
      images: media.thumbnailUrl ? [{ url: media.thumbnailUrl }] : undefined,
      type: "video.other",
    },
  };
}

export default async function KellySpeaksDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const media = getPublishedCampaignMediaBySlug(slug);
  if (!media) notFound();

  const related = listPublishedCampaignMedia()
    .filter((m) => m.id !== media.id)
    .slice(0, 4);

  return (
    <div className="bg-kelly-cream pb-20 pt-10 md:pt-14">
      <CampaignVideoStructuredData media={media} />
      <ContentContainer>
        <p className="font-body text-sm font-semibold text-kelly-navy">
          <Link href="/kelly-speaks" className="underline-offset-2 hover:underline">
            ← Kelly Speaks
          </Link>
        </p>

        <div className="mx-auto mt-8 max-w-4xl">
          {media.format === "SHORT" ? (
            <CampaignShortCard media={media} />
          ) : (
            <CampaignVideoCard media={media} />
          )}
        </div>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 max-w-4xl" aria-labelledby="related-videos-heading">
            <h2 id="related-videos-heading" className="font-heading text-2xl font-bold text-kelly-ink">
              More from Kelly Speaks
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {related.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/kelly-speaks/${m.slug}`}
                    className="block rounded-card border border-kelly-ink/10 bg-white px-4 py-3 font-heading text-lg font-bold text-kelly-ink hover:border-kelly-navy/30"
                  >
                    {m.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mx-auto mt-12 max-w-4xl font-body text-base text-kelly-slate">
          Ready to take the next step?{" "}
          <Link href="/volunteer" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            Volunteer
          </Link>{" "}
          or{" "}
          <Link href="/get-involved" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            get involved
          </Link>
          .
        </p>
      </ContentContainer>
    </div>
  );
}
