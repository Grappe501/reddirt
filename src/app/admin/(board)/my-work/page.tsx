import Link from "next/link";

import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { OperationsMyWorkPanel } from "@/components/volunteers/OperationsMyWorkPanel";
import { loadCmRoleInbox } from "@/lib/volunteers/ops-work-items";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My work | Campaign manager",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ opsWork?: string }>;
};

export default async function AdminMyWorkPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const inbox = await loadCmRoleInbox(60);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin/campaign-manager-dashboard" className="text-xs font-semibold text-kelly-muted hover:underline">
        ← Campaign manager dashboard
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">My work</h1>
      <p className="mt-2 max-w-2xl text-sm text-kelly-muted">
        CM escalations, overdue and blocked tasks, and statewide ops items from the command ladder.
      </p>
      <div className="mt-6">
        <OperationsMyWorkPanel
          payload={inbox}
          surface="admin"
          returnTo="/admin/my-work"
          statusMessage={params.opsWork ?? null}
          title="Campaign manager inbox"
          subtitle="Intake escalations, blocked work, ladder tasks, and overdue items — one queue for statewide ops."
          viewAllHref="/admin/my-work"
        />
      </div>
    </div>
  );
}
