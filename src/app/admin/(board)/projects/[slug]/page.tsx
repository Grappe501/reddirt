import Link from "next/link";
import { notFound } from "next/navigation";

import { CampaignProjectBoardPanel } from "@/components/volunteers/CampaignProjectsPanel";
import { loadCampaignProjectBoard } from "@/lib/volunteers/campaign-projects";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Project board | Campaign manager",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ project?: string }>;
};

export default async function AdminProjectDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const payload = await loadCampaignProjectBoard(slug, "/admin/projects");

  if (!payload.project) notFound();

  const returnTo = `/admin/projects/${slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/admin/projects" className="text-xs font-semibold text-kelly-muted hover:underline">
        ← All projects
      </Link>
      <div className="mt-8">
        <CampaignProjectBoardPanel payload={payload} returnTo={returnTo} notice={query.project ?? null} />
      </div>
    </div>
  );
}
