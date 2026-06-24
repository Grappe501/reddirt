import Link from "next/link";

import { CampaignProjectsListPanel } from "@/components/volunteers/CampaignProjectsPanel";
import { loadCampaignProjectList } from "@/lib/volunteers/campaign-projects";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects | Campaign manager",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ project?: string }>;
};

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const payload = await loadCampaignProjectList("/admin/projects");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/admin/campaign-manager-dashboard" className="text-xs font-semibold text-kelly-muted hover:underline">
        ← Campaign manager dashboard
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">Campaign projects</h1>
      <p className="mt-2 max-w-2xl text-sm text-kelly-muted">
        Statewide coordinated pushes — same project layer as operators, CM-owned templates for Labor Day and lane drives.
      </p>
      <div className="mt-8">
        <CampaignProjectsListPanel payload={payload} returnTo="/admin/projects" notice={params.project ?? null} />
      </div>
    </div>
  );
}
