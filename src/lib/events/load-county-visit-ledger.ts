import { CampaignEventStatus, CampaignEventType } from "@prisma/client";
import { kellyCampaignStops } from "@/data/kelly-county-visits/kelly-county-visits";
import { prisma } from "@/lib/db";
import { isPrismaLiveDataUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import {
  buildCountyVisitLedger,
  type CampaignAppearanceRow,
  type CountyVisitLedger,
} from "@/lib/events/county-visit-ledger";
import type { EventItem } from "@/content/types";

const NON_APPEARANCE = [
  CampaignEventType.TRAINING,
  CampaignEventType.ORIENTATION,
  CampaignEventType.CANVASS,
  CampaignEventType.PHONE_BANK,
  CampaignEventType.DEADLINE,
] as const;

async function loadCampaignAppearanceRows(): Promise<CampaignAppearanceRow[]> {
  try {
    const rows = await prisma.campaignEvent.findMany({
      where: {
        countyId: { not: null },
        status: {
          notIn: [CampaignEventStatus.DRAFT, CampaignEventStatus.CANCELLED],
        },
        eventType: { notIn: [...NON_APPEARANCE] },
      },
      select: {
        id: true,
        slug: true,
        startAt: true,
        endAt: true,
        timezone: true,
        eventType: true,
        status: true,
        locationName: true,
        address: true,
        county: { select: { displayName: true, slug: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      startAt: r.startAt,
      endAt: r.endAt,
      timezone: r.timezone,
      eventType: r.eventType,
      status: r.status,
      locationName: r.locationName,
      address: r.address,
      countyDisplayName: r.county?.displayName ?? null,
      countySlug: r.county?.slug ?? null,
    }));
  } catch (e) {
    if (isPrismaLiveDataUnavailable(e)) {
      logPrismaDatabaseUnavailable("loadCampaignAppearanceRows", e);
      return [];
    }
    throw e;
  }
}

/**
 * Build-time county visit ledger: historical 51-county seed plus ended qualifying appearances.
 * Netlify rebuilds re-evaluate `endAt` in America/Chicago — no archive table.
 */
export async function loadCountyVisitLedger(
  movementEvents: EventItem[] = [],
  now: Date = new Date(),
): Promise<CountyVisitLedger> {
  const campaignEvents = await loadCampaignAppearanceRows();
  return buildCountyVisitLedger({
    now,
    historicalStops: kellyCampaignStops,
    campaignEvents,
    movementEvents,
  });
}
