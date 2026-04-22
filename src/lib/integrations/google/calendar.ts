/**
 * Google Calendar API wrapper. Requires OAuth tokens on `CalendarSource.oauthJson`
 * and env from `getGoogleCalendarEnv` for initial consent.
 */
import type { calendar_v3 } from "googleapis";
import { google } from "googleapis";
import type { CalendarSource } from "@prisma/client";
import { createOAuth2Client } from "./auth";
import { prisma } from "@/lib/db";

type OAuthJson = { refresh_token?: string; access_token?: string; expiry_date?: number };

export function getCalendarApiForSource(source: CalendarSource) {
  const o = (source.oauthJson ?? {}) as OAuthJson;
  if (!o.refresh_token) {
    throw new Error(`Calendar source ${source.id} has no refresh_token; complete OAuth.`);
  }
  const client = createOAuth2Client();
  client.setCredentials({ refresh_token: o.refresh_token, access_token: o.access_token, expiry_date: o.expiry_date });
  return google.calendar({ version: "v3", auth: client });
}

export async function listGoogleCalendars(sourceId: string) {
  const source = await prisma.calendarSource.findUniqueOrThrow({ where: { id: sourceId } });
  const cal = getCalendarApiForSource(source);
  const res = await cal.calendarList.list();
  return res.data.items ?? [];
}

/**
 * Insert or update a Prisma `CampaignEvent` on Google. Caller persists googleEventId/etag.
 */
export async function upsertGoogleEvent(
  source: CalendarSource,
  body: calendar_v3.Schema$Event
): Promise<calendar_v3.Schema$Event> {
  const cal = getCalendarApiForSource(source);
  const calId = source.externalCalendarId;
  if (body.id) {
    const u = await cal.events.update({ calendarId: calId, eventId: String(body.id), requestBody: body });
    return u.data;
  }
  const ins = await cal.events.insert({ calendarId: calId, requestBody: body });
  return ins.data;
}

/**
 * Incremental list — uses sync token stored on `CalendarSource`.
 */
export async function incrementalListEvents(sourceId: string) {
  const source = await prisma.calendarSource.findUniqueOrThrow({ where: { id: sourceId } });
  const cal = getCalendarApiForSource(source);
  const res = await cal.events.list({
    calendarId: source.externalCalendarId,
    maxResults: 250,
    singleEvents: true,
    syncToken: source.syncToken ?? undefined,
  });
  return { items: res.data.items ?? [], nextSyncToken: res.data.nextSyncToken, nextPageToken: res.data.nextPageToken };
}

/**
 * Register push notifications (call from cron before expiration).
 */
export async function registerWatch(
  sourceId: string,
  channelId: string,
  webHookUrl: string,
  token?: string
): Promise<calendar_v3.Schema$Channel> {
  const source = await prisma.calendarSource.findUniqueOrThrow({ where: { id: sourceId } });
  const cal = getCalendarApiForSource(source);
  const res = await cal.events.watch({
    calendarId: source.externalCalendarId,
    requestBody: {
      id: channelId,
      type: "web_hook",
      address: webHookUrl,
      token,
    },
  });
  return res.data;
}

export async function stopChannelForSource(source: CalendarSource, channelId: string, resourceId: string) {
  const cal = getCalendarApiForSource(source);
  return cal.channels.stop({ requestBody: { id: channelId, resourceId } });
}

export async function deleteGoogleEvent(source: CalendarSource, eventId: string) {
  const cal = getCalendarApiForSource(source);
  await cal.events.delete({ calendarId: source.externalCalendarId, eventId });
}

export async function getGoogleEvent(source: CalendarSource, eventId: string) {
  const cal = getCalendarApiForSource(source);
  const res = await cal.events.get({ calendarId: source.externalCalendarId, eventId });
  return res.data;
}

/**
 * List events in time window with pagination; on last page, persist `nextSyncToken` to DB for incremental.
 */
export async function fullListEstablishSyncToken(sourceId: string) {
  const source = await prisma.calendarSource.findUniqueOrThrow({ where: { id: sourceId } });
  const cal = getCalendarApiForSource(source);
  const timeMin = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
  const timeMax = new Date(Date.now() + 500 * 24 * 3600 * 1000).toISOString();
  let pageToken: string | undefined;
  let nextSyncToken: string | undefined;
  // Paginate; Google returns `nextSyncToken` on the last page of a full time-ranged list.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await cal.events.list({
      calendarId: source.externalCalendarId,
      timeMin,
      timeMax,
      maxResults: 250,
      singleEvents: true,
      showDeleted: true,
      pageToken,
    });
    if (res.data.nextSyncToken) nextSyncToken = res.data.nextSyncToken;
    const next = res.data.nextPageToken;
    if (!next) break;
    pageToken = next;
  }
  if (nextSyncToken) {
    await prisma.calendarSource.update({
      where: { id: sourceId },
      data: { syncToken: nextSyncToken, lastFullSyncAt: new Date() },
    });
  }
  return { nextSyncToken: nextSyncToken ?? null };
}
