import { V4ElectionFundingDepthSectionPanel } from "@/components/admin/intelligence/v4/V4ElectionFundingDepthPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getElectionFundingDepthSection, getAllElectionFundingDepthSectionIds } from "@/lib/intelligence/v4/electionFundingDrillDownDepth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllElectionFundingDepthSectionIds().map((sectionId) => ({ sectionId }));
}

export default async function ElectionFundingSectionPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const section = getElectionFundingDepthSection(sectionId);
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Election funding · ${section.eyebrow}`}
        title={section.title}
        description={section.whyItMattersForKelly}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/election-funding"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          All sections
        </Link>
      </V4PageHeader>
      <V4ElectionFundingDepthSectionPanel sectionId={sectionId} />
    </div>
  );
}
