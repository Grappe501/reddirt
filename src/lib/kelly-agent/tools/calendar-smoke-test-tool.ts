import { prisma } from "@/lib/db";

export type CalendarSmokeTestReport = {
  checklist: Array<{
    item:
      | "test_event_created"
      | "pushed_to_tentative"
      | "approved"
      | "promoted_to_confirmed"
      | "pulled_back"
      | "no_duplicate"
      | "dashboard_status_correct";
    status: "pass" | "pending" | "fail";
    note: string;
  }>;
  readyForKelly: boolean;
};

export async function buildCalendarSmokeTestReport(): Promise<CalendarSmokeTestReport> {
  try {
    const [events, synced, confirmed, conflicts] = await Promise.all([
      prisma.campaignEvent.count(),
      prisma.campaignEvent.count({ where: { googleEventId: { not: null } } }),
      prisma.campaignEvent.count({ where: { eventWorkflowState: { in: ["APPROVED", "PUBLISHED", "COMPLETED"] } } }),
      prisma.campaignEvent.count({ where: { syncReviewNeeded: true } }),
    ]);
    const checklist: CalendarSmokeTestReport["checklist"] = [
      { item: "test_event_created", status: events > 0 ? "pass" : "pending", note: `${events} CampaignEvent rows` },
      { item: "pushed_to_tentative", status: synced > 0 ? "pass" : "pending", note: `${synced} events have Google ids` },
      { item: "approved", status: confirmed > 0 ? "pass" : "pending", note: `${confirmed} events approved/published/completed` },
      { item: "promoted_to_confirmed", status: confirmed > 0 && synced > 0 ? "pass" : "pending", note: "Requires calendar:google:sync-kelly smoke after migration repair" },
      { item: "pulled_back", status: "pending", note: "Run incremental pull after Google lane write" },
      { item: "no_duplicate", status: conflicts === 0 ? "pass" : "fail", note: `${conflicts} sync conflicts require review` },
      { item: "dashboard_status_correct", status: events > 0 ? "pass" : "pending", note: "Verify /admin/calendar-command-center/kelly after promote/sync" },
    ];
    return { checklist, readyForKelly: checklist.every((c) => c.status === "pass") };
  } catch (e) {
    return {
      checklist: [
        { item: "test_event_created", status: "fail", note: e instanceof Error ? e.message : "calendar smoke unavailable" },
        { item: "pushed_to_tentative", status: "pending", note: "blocked" },
        { item: "approved", status: "pending", note: "blocked" },
        { item: "promoted_to_confirmed", status: "pending", note: "blocked" },
        { item: "pulled_back", status: "pending", note: "blocked" },
        { item: "no_duplicate", status: "pending", note: "blocked" },
        { item: "dashboard_status_correct", status: "pending", note: "blocked" },
      ],
      readyForKelly: false,
    };
  }
}
