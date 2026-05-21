import Link from "next/link";
import { CalendarPromotionWorkbench } from "@/components/admin/campaign-events/CalendarPromotionWorkbench";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";
import { loadPromotionWorkbench } from "@/lib/campaign-events/calendar-promotion/load-promotion-workbench";

export const dynamic = "force-dynamic";

export default async function CalendarPromotionPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const period = sp.month ?? "2026-03";
  const snapshot = await loadPromotionWorkbench(period);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign operating system · Sprint 5"
        title="Calendar promotion command center"
        description="Human-controlled promotion from approved ledger events to Kelly tentative or official Google Calendar lanes. No background automation."
        actions={
          <>
            <Link href={`/admin/campaign-events/calendar-sync?month=${period}`} className="rounded-full border px-4 py-2 text-sm font-bold">
              Calendar sync
            </Link>
            <Link href="/admin/campaign-events/ai-tools" className="rounded-full border px-4 py-2 text-sm font-bold">
              AI tools
            </Link>
          </>
        }
      />
      <CampaignEventsNav />
      <CalendarPromotionWorkbench snapshot={snapshot} />
    </div>
  );
}
