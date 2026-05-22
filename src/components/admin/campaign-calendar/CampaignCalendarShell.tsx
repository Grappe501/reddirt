"use client";

import { useRouter } from "next/navigation";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import { EventReviewModal } from "@/components/admin/campaign-events/EventReviewModal";
import { CampaignCalendarProvider, useCampaignCalendar } from "./campaign-calendar-context";
import { CampaignCalendarNav } from "./CampaignCalendarNav";

function ReviewModalHost() {
  const { reviewRecordId, setReviewRecordId } = useCampaignCalendar();
  const router = useRouter();
  if (!reviewRecordId) return null;
  return (
    <EventReviewModal
      recordId={reviewRecordId}
      onClose={() => {
        setReviewRecordId(null);
        router.refresh();
      }}
    />
  );
}

export function CampaignCalendarShell({
  rows,
  electionDayYmd,
  nowMs,
  children,
}: {
  rows: CalendarSurfaceRow[];
  electionDayYmd: string;
  nowMs: number;
  children: React.ReactNode;
}) {
  return (
    <CampaignCalendarProvider rows={rows} electionDayYmd={electionDayYmd} nowMs={nowMs}>
      <CampaignCalendarNav eventCount={rows.length} />
      <div className="mt-6">{children}</div>
      <ReviewModalHost />
    </CampaignCalendarProvider>
  );
}
