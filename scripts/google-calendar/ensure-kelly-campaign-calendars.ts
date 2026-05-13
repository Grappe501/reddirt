/**
 * Ensure Google secondary calendars + Prisma CalendarSource rows for Kelly V2 lanes.
 *
 *   npm run calendar:google:ensure
 *
 * Requires DATABASE_URL, Google OAuth on an anchor `CalendarSource` (refresh_token),
 * and env `KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID` pointing at that source row.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CalendarSourceType, CalendarSourceVisibility } from "@prisma/client";
import { prisma } from "../../src/lib/db";
import { insertSecondaryCalendar, listGoogleCalendars } from "../../src/lib/integrations/google/calendar";
import {
  KELLY_GOOGLE_CONFIRMED_SOURCE_LABEL,
  KELLY_GOOGLE_CONFIRMED_SUMMARY,
  KELLY_GOOGLE_TENTATIVE_SOURCE_LABEL,
  KELLY_GOOGLE_TENTATIVE_SUMMARY,
} from "../../src/lib/calendar/kelly-google-calendar-constants";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
loadRedDirtEnv(REPO);

async function upsertKellySource(params: {
  anchorId: string;
  summary: string;
  label: string;
  sourceType: CalendarSourceType;
  oauthJson: object;
}) {
  const anchor = await prisma.calendarSource.findUniqueOrThrow({ where: { id: params.anchorId } });
  const list = await listGoogleCalendars(params.anchorId);
  let googleCalId = list.find((c) => (c.summary ?? "").trim() === params.summary)?.id;
  if (!googleCalId) {
    const created = await insertSecondaryCalendar(anchor, params.summary);
    googleCalId = created.id ?? undefined;
  }
  if (!googleCalId) throw new Error(`Failed to resolve Google calendar id for ${params.summary}`);

  const found = await prisma.calendarSource.findFirst({ where: { label: params.label } });
  const data = {
    displayName: params.summary,
    sourceType: params.sourceType,
    isPublicFacing: false,
    provider: "GOOGLE" as const,
    externalCalendarId: googleCalId,
    visibility: CalendarSourceVisibility.STAFF,
    isActive: true,
    syncEnabled: true,
    oauthJson: params.oauthJson as object,
  };
  if (found) {
    return prisma.calendarSource.update({ where: { id: found.id }, data });
  }
  return prisma.calendarSource.create({
    data: {
      label: params.label,
      ...data,
    },
  });
}

async function main() {
  const anchorId = process.env.KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID?.trim();
  if (!anchorId) {
    console.error("Set KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID to a CalendarSource id that already has Google OAuth (refresh_token).");
    process.exit(1);
  }
  const anchor = await prisma.calendarSource.findUnique({ where: { id: anchorId } });
  if (!anchor) {
    console.error("Anchor CalendarSource not found.");
    process.exit(1);
  }
  const oauth = (anchor.oauthJson ?? {}) as { refresh_token?: string };
  if (!oauth.refresh_token) {
    console.error("Anchor source has no refresh_token — complete Google Calendar OAuth for that source first.");
    process.exit(1);
  }

  const tentative = await upsertKellySource({
    anchorId,
    summary: KELLY_GOOGLE_TENTATIVE_SUMMARY,
    label: KELLY_GOOGLE_TENTATIVE_SOURCE_LABEL,
    sourceType: CalendarSourceType.KELLY_GOOGLE_TENTATIVE,
    oauthJson: oauth,
  });
  const confirmed = await upsertKellySource({
    anchorId,
    summary: KELLY_GOOGLE_CONFIRMED_SUMMARY,
    label: KELLY_GOOGLE_CONFIRMED_SOURCE_LABEL,
    sourceType: CalendarSourceType.KELLY_GOOGLE_CONFIRMED,
    oauthJson: oauth,
  });

  // eslint-disable-next-line no-console -- CLI output
  console.log(
    JSON.stringify(
      {
        ok: true,
        tentative: { prismaId: tentative.id, googleCalendarId: tentative.externalCalendarId },
        confirmed: { prismaId: confirmed.id, googleCalendarId: confirmed.externalCalendarId },
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
