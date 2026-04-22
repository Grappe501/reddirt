import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CirculatingInitiativesSection } from "@/components/direct-democracy/CirculatingInitiativesSection";
import { FriendInviteScriptsSection } from "@/components/resources/FriendInviteScriptsSection";
import { ToolkitGuideView } from "@/components/resources/ToolkitGuideView";
import { getToolkitGuide, getToolkitSlugs } from "@/content/resources/toolkit";
import { pageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getToolkitSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getToolkitGuide(slug);
  if (!g) return { title: "Resource" };
  return pageMeta({
    title: g.title,
    description: g.shortDescription,
    path: `/resources/${g.slug}`,
    imageSrc: "/media/placeholders/explainer-steps.svg",
  });
}

export default async function ToolkitGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getToolkitGuide(slug);
  if (!guide) notFound();
  const insertBeforeGoDeeper =
    slug === "talking-about-kelly" ? (
      <FriendInviteScriptsSection />
    ) : slug === "direct-democracy-guide" ? (
      <CirculatingInitiativesSection />
    ) : null;

  return <ToolkitGuideView guide={guide} insertBeforeGoDeeper={insertBeforeGoDeeper} />;
}
