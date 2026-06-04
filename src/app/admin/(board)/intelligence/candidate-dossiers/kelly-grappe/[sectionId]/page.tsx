import { V4KellyDossierSectionPanel } from "@/components/admin/intelligence/v4/V4KellyCandidateDossierPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  getKellyDossierSection,
} from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function KellyDossierSectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getKellyDossierSection(sectionId);
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Kelly alignment · ${section.eyebrow}`}
        title={section.title}
        description={section.debateFramingExample}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/candidate-dossiers/kelly-grappe"
          className="rounded-full border border-emerald-300 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Full profile
        </Link>
      </V4PageHeader>
      <V4KellyDossierSectionPanel sectionId={sectionId} />
    </div>
  );
}
