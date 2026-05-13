/**
 * Batch: Kelly-approved JSON items → CampaignEvent APPROVED → Confirmed Google lane.
 *
 *   npm run calendar:google:promote-approved
 *
 * Skips events in CONFLICT or syncReviewNeeded. Prints JSON report to stdout.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EventWorkflowState, GoogleEventSyncState, KellyCockpitDecisionKind } from "@prisma/client";
import { prisma } from "../../src/lib/db";
import { promoteKellyCalendarItemToCampaignEvent } from "../../src/lib/calendar/kelly-promote-json-item";
import { syncKellyCampaignEventToGoogle } from "../../src/lib/calendar/kelly-sync-campaign-event-google";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
loadRedDirtEnv(REPO);

function actor() {
  return process.env.KELLY_COCKPIT_ACTOR_ID?.trim() || "batch-kelly-google-promote";
}

async function latestApprovedCalendarItemIds(): Promise<string[]> {
  const rows = await prisma.kellyCalendarDecision.findMany({
    orderBy: { createdAt: "desc" },
    select: { calendarItemId: true, decision: true },
  });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    if (seen.has(r.calendarItemId)) continue;
    seen.add(r.calendarItemId);
    if (r.decision === KellyCockpitDecisionKind.APPROVE) out.push(r.calendarItemId);
  }
  return out;
}

async function main() {
  const promoted: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  const failed: { id: string; error: string }[] = [];
  const conflicts: string[] = [];

  const ids = await latestApprovedCalendarItemIds();

  for (const calendarItemId of ids) {
    try {
      const { campaignEventId } = await promoteKellyCalendarItemToCampaignEvent(calendarItemId, actor());
      const ev = await prisma.campaignEvent.findUnique({
        where: { id: campaignEventId },
        select: {
          googleSyncState: true,
          syncReviewNeeded: true,
          eventWorkflowState: true,
        },
      });
      if (!ev) {
        failed.push({ id: calendarItemId, error: "CampaignEvent missing after promote" });
        continue;
      }
      if (ev.googleSyncState === GoogleEventSyncState.CONFLICT || ev.syncReviewNeeded) {
        conflicts.push(calendarItemId);
        skipped.push({ id: calendarItemId, reason: "conflict_or_review" });
        continue;
      }

      if (ev.eventWorkflowState !== EventWorkflowState.APPROVED) {
        await prisma.campaignEvent.update({
          where: { id: campaignEventId },
          data: { eventWorkflowState: EventWorkflowState.APPROVED, approvedAt: new Date() },
        });
      }

      await syncKellyCampaignEventToGoogle(campaignEventId, null);
      promoted.push(calendarItemId);
    } catch (e) {
      failed.push({ id: calendarItemId, error: e instanceof Error ? e.message : String(e) });
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        scanned: ids.length,
        promoted,
        skipped,
        failed,
        conflicts,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
