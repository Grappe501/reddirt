import { V4AccaConferenceDepthSectionPanel } from "@/components/admin/intelligence/v4/V4AccaConferencePrepPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getAccaConferenceDepthSection, getAllAccaConferenceDepthSectionIds } from "@/lib/intelligence/v4/accaClerksConference2026Depth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllAccaConferenceDepthSectionIds().map((sectionId) => ({ sectionId }));
}

export default async function AccaConferenceSectionPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const section = getAccaConferenceDepthSection(sectionId);
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`ACCA 2026 · ${section.eyebrow}`}
        title={section.title}
        description={section.whyItMattersForKelly}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/county-clerk-week/acca-summer-conference"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          All sections
        </Link>
      </V4PageHeader>
      <V4AccaConferenceDepthSectionPanel sectionId={sectionId} />
    </div>
  );
}
