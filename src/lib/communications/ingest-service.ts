import "server-only";

import type { CommunicationIdentitySignalSource, GmailMessageParticipantRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getGmailApiForStaffUser } from "@/lib/gmail/client";
import { fetchGmailMessageForIngest, buildGmailIngestQuery, extractParticipantsFromDto, listGmailMessageIdsForQuery, mapGmailMessageToDto } from "@/lib/google/gmail-ingest";
import type { GmailIngestQueryParams } from "@/lib/google/gmail-ingest";
import { listGooglePeopleConnectionsPage } from "@/lib/google/google-contacts-ingest";
import { getGmailAuthForUser } from "@/lib/integrations/gmail/gmail-api";
import { calendarEventIsPrivate, listCalendarEventsForIngestWindow } from "@/lib/google/google-calendar-ingest";
import { deriveSignalsFromCalendarAttendee, deriveSignalsFromGmailParticipant, deriveSignalsFromGoogleContactSummary } from "@/lib/communications/identity-signals";
import {
  createCommunicationMatchCandidatesForIdentity,
  ensureCommunicationIdentityForEmail,
  matchCommunicationIdentityToEmailContactProfiles,
} from "@/lib/communications/profile-matching";
import { normalizeEmail } from "@/lib/communications/email-address";

export type IngestStats = {
  scanned: number;
  created: number;
  updated: number;
  skipped: number;
  duplicates: number;
  identitiesCreated: number;
  identitiesLinked: number;
  matchCandidatesCreated: number;
  suppressedDetected: number;
  errors: number;
};

function emptyStats(): IngestStats {
  return {
    scanned: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    duplicates: 0,
    identitiesCreated: 0,
    identitiesLinked: 0,
    matchCandidatesCreated: 0,
    suppressedDetected: 0,
    errors: 0,
  };
}

export async function previewGmailIngest(input: {
  staffUserId: string;
  query: GmailIngestQueryParams;
  maxMessages: number;
}): Promise<{ ok: boolean; q: string; listed: number; sampleIds: string[]; error?: string }> {
  const gmail = await getGmailApiForStaffUser(input.staffUserId);
  if (!gmail) return { ok: false, q: "", listed: 0, sampleIds: [], error: "Gmail API not available for this user." };
  const q = buildGmailIngestQuery(input.query);
  const { ids } = await listGmailMessageIdsForQuery(gmail, { q, maxResults: Math.min(input.maxMessages, 50) });
  return { ok: true, q, listed: ids.length, sampleIds: ids.slice(0, 15) };
}

export async function runGmailIngest(input: {
  staffUserId: string;
  providerAccountEmail: string | null;
  requestedByUserId: string | null;
  ingestRunId: string;
  query: GmailIngestQueryParams;
  maxMessages: number;
  bodyStorageMode: "METADATA_ONLY" | "SNIPPET_AND_HEADERS" | "FULL_TEXT";
}): Promise<IngestStats> {
  const stats = emptyStats();
  const gmail = await getGmailApiForStaffUser(input.staffUserId);
  if (!gmail) {
    stats.errors += 1;
    return stats;
  }
  const q = buildGmailIngestQuery(input.query);
  const includeFullBody = input.bodyStorageMode === "FULL_TEXT";
  const format = includeFullBody ? "full" : "metadata";
  let pageToken: string | undefined;
  let processed = 0;
  while (processed < input.maxMessages) {
    const page = await listGmailMessageIdsForQuery(gmail, {
      q,
      maxResults: Math.min(100, input.maxMessages - processed),
      pageToken,
    });
    pageToken = page.nextPageToken;
    for (const id of page.ids) {
      if (processed >= input.maxMessages) break;
      processed += 1;
      stats.scanned += 1;
      try {
        const raw = await fetchGmailMessageForIngest(gmail, id, format);
        const dto = mapGmailMessageToDto(raw, { includeFullBody });
        const existing = await prisma.gmailMessageRecord.findUnique({
          where: {
            staffUserId_googleMessageId: { staffUserId: input.staffUserId, googleMessageId: dto.googleMessageId },
          },
          select: { id: true },
        });
        const row = await prisma.gmailMessageRecord.upsert({
          where: {
            staffUserId_googleMessageId: { staffUserId: input.staffUserId, googleMessageId: dto.googleMessageId },
          },
          create: {
            googleMessageId: dto.googleMessageId,
            googleThreadId: dto.googleThreadId,
            historyId: dto.historyId,
            internalDate: dto.internalDate,
            sentAt: dto.sentAt,
            subject: dto.subject,
            snippet: dto.snippet,
            labelIdsJson: dto.labelIds,
            fromText: dto.fromText,
            toText: dto.toText,
            ccText: dto.ccText,
            bccText: dto.bccText,
            replyToText: dto.replyToText,
            bodyText: dto.bodyText,
            bodyHash: dto.bodyHash,
            hasAttachments: dto.hasAttachments,
            attachmentCount: dto.attachmentCount,
            sizeEstimate: dto.sizeEstimate,
            providerAccountEmail: input.providerAccountEmail,
            staffUserId: input.staffUserId,
            ingestRunId: input.ingestRunId,
            rawHeadersJson: dto.rawHeadersJson as Prisma.InputJsonValue,
            bodyStorageMode: input.bodyStorageMode,
          },
          update: {
            googleThreadId: dto.googleThreadId,
            historyId: dto.historyId,
            internalDate: dto.internalDate,
            sentAt: dto.sentAt,
            subject: dto.subject,
            snippet: dto.snippet,
            labelIdsJson: dto.labelIds,
            fromText: dto.fromText,
            toText: dto.toText,
            ccText: dto.ccText,
            bccText: dto.bccText,
            replyToText: dto.replyToText,
            bodyText: dto.bodyText,
            bodyHash: dto.bodyHash,
            hasAttachments: dto.hasAttachments,
            attachmentCount: dto.attachmentCount,
            sizeEstimate: dto.sizeEstimate,
            rawHeadersJson: dto.rawHeadersJson as Prisma.InputJsonValue,
            bodyStorageMode: input.bodyStorageMode,
            ingestRunId: input.ingestRunId,
          },
        });
        if (existing) {
          stats.updated += 1;
        } else {
          stats.created += 1;
        }
        await prisma.gmailMessageParticipant.deleteMany({ where: { gmailMessageRecordId: row.id } });
        const parts = extractParticipantsFromDto(dto);
        for (const p of parts) {
          const ident = await ensureCommunicationIdentityForEmail({
            normalizedEmail: p.normalizedEmail,
            displayName: p.displayName,
          });
          if (ident.suppressed) stats.suppressedDetected += 1;
          if (ident.created) stats.identitiesCreated += 1;
          if (!ident.suppressed) {
            const match = await matchCommunicationIdentityToEmailContactProfiles({
              id: ident.id,
              normalizedEmail: p.normalizedEmail,
            });
            const mc = await createCommunicationMatchCandidatesForIdentity(ident.id, match.profiles, match.conflict);
            stats.matchCandidatesCreated += mc;
          }
          await prisma.gmailMessageParticipant.create({
            data: {
              gmailMessageRecordId: row.id,
              role: p.role as GmailMessageParticipantRole,
              email: p.email,
              displayName: p.displayName,
              domain: p.domain,
              normalizedEmail: p.normalizedEmail,
              communicationIdentityId: ident.id,
            },
          });
          if (!ident.suppressed) {
            const drafts = deriveSignalsFromGmailParticipant({
              normalizedEmail: p.normalizedEmail,
              displayName: p.displayName,
              messageId: row.id,
            });
            for (const d of drafts) {
              await prisma.communicationIdentitySignal.create({
                data: {
                  communicationIdentityId: ident.id,
                  source: d.source as CommunicationIdentitySignalSource,
                  signalType: d.signalType,
                  value: d.value,
                  confidence: d.confidence,
                  evidenceJson: d.evidenceJson as Prisma.InputJsonValue,
                  approvedForAudienceUse: false,
                },
              });
            }
          }
        }
      } catch {
        stats.errors += 1;
      }
    }
    if (!pageToken || page.ids.length === 0) break;
  }
  return stats;
}

export async function previewGoogleContactsIngest(input: { staffUserId: string; pageSize: number }): Promise<{
  ok: boolean;
  count: number;
  error?: string;
}> {
  const auth = await getGmailAuthForUser(input.staffUserId);
  if (!auth) return { ok: false, count: 0, error: "No OAuth client for this user (use Staff Gmail connect)." };
  const page = await listGooglePeopleConnectionsPage({ auth, pageSize: input.pageSize });
  if (page.rawError) return { ok: false, count: 0, error: page.rawError };
  return { ok: true, count: page.people.length };
}

export async function runGoogleContactsIngest(input: {
  staffUserId: string;
  providerAccountEmail: string | null;
  ingestRunId: string;
  maxContacts: number;
}): Promise<IngestStats> {
  const stats = emptyStats();
  const auth = await getGmailAuthForUser(input.staffUserId);
  if (!auth) {
    stats.errors += 1;
    return stats;
  }
  let pageToken: string | undefined;
  while (stats.scanned < input.maxContacts) {
    const page = await listGooglePeopleConnectionsPage({
      auth,
      pageSize: Math.min(200, input.maxContacts - stats.scanned),
      pageToken,
    });
    if (page.rawError) {
      stats.errors += 1;
      break;
    }
    pageToken = page.nextPageToken;
    for (const p of page.people) {
      if (stats.scanned >= input.maxContacts) break;
      stats.scanned += 1;
      try {
        const existing = await prisma.googleContactRecord.findUnique({
          where: { googleResourceName: p.googleResourceName },
          select: { id: true },
        });
        let identityId: string | null = null;
        if (p.primaryEmail) {
          const ident = await ensureCommunicationIdentityForEmail({
            normalizedEmail: normalizeEmail(p.primaryEmail),
            displayName: p.displayName,
          });
          identityId = ident.id;
          if (ident.created) stats.identitiesCreated += 1;
          if (ident.suppressed) stats.suppressedDetected += 1;
          if (!ident.suppressed) {
            const match = await matchCommunicationIdentityToEmailContactProfiles({
              id: ident.id,
              normalizedEmail: normalizeEmail(p.primaryEmail),
            });
            stats.matchCandidatesCreated += await createCommunicationMatchCandidatesForIdentity(
              ident.id,
              match.profiles,
              match.conflict,
            );
            const drafts = deriveSignalsFromGoogleContactSummary({
              primaryEmail: p.primaryEmail,
              displayName: p.displayName,
              resourceName: p.googleResourceName,
            });
            for (const d of drafts) {
              await prisma.communicationIdentitySignal.create({
                data: {
                  communicationIdentityId: ident.id,
                  source: d.source as CommunicationIdentitySignalSource,
                  signalType: d.signalType,
                  value: d.value,
                  confidence: d.confidence,
                  evidenceJson: d.evidenceJson as Prisma.InputJsonValue,
                  approvedForAudienceUse: false,
                },
              });
            }
          }
        }
        await prisma.googleContactRecord.upsert({
          where: { googleResourceName: p.googleResourceName },
          create: {
            googleResourceName: p.googleResourceName,
            etag: p.etag,
            displayName: p.displayName,
            givenName: p.givenName,
            familyName: p.familyName,
            primaryEmail: p.primaryEmail,
            emailsJson: p.emailsJson as Prisma.InputJsonValue,
            phonesJson: p.phonesJson as Prisma.InputJsonValue,
            providerAccountEmail: input.providerAccountEmail,
            ingestRunId: input.ingestRunId,
            communicationIdentityId: identityId,
          },
          update: {
            etag: p.etag,
            displayName: p.displayName,
            givenName: p.givenName,
            familyName: p.familyName,
            primaryEmail: p.primaryEmail,
            emailsJson: p.emailsJson as Prisma.InputJsonValue,
            phonesJson: p.phonesJson as Prisma.InputJsonValue,
            ingestRunId: input.ingestRunId,
            communicationIdentityId: identityId ?? undefined,
          },
        });
        if (existing) stats.updated += 1;
        else stats.created += 1;
      } catch {
        stats.errors += 1;
      }
    }
    if (!pageToken || page.people.length === 0) break;
  }
  return stats;
}

export async function previewGoogleCalendarIngest(input: {
  calendarSourceId: string;
  timeMin: Date;
  timeMax: Date;
  maxEvents: number;
  includeCanceled: boolean;
}): Promise<{ ok: boolean; count: number; error?: string }> {
  try {
    const evs = await listCalendarEventsForIngestWindow({
      calendarSourceId: input.calendarSourceId,
      timeMin: input.timeMin,
      timeMax: input.timeMax,
      maxEvents: Math.min(input.maxEvents, 50),
      includeCanceled: input.includeCanceled,
    });
    return { ok: true, count: evs.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, count: 0, error: msg };
  }
}

export async function runGoogleCalendarIngest(input: {
  calendarSourceId: string;
  providerAccountEmail: string | null;
  ingestRunId: string;
  timeMin: Date;
  timeMax: Date;
  maxEvents: number;
  includeCanceled: boolean;
  includePrivateDetails: boolean;
}): Promise<IngestStats> {
  const stats = emptyStats();
  try {
    const evs = await listCalendarEventsForIngestWindow({
      calendarSourceId: input.calendarSourceId,
      timeMin: input.timeMin,
      timeMax: input.timeMax,
      maxEvents: input.maxEvents,
      includeCanceled: input.includeCanceled,
    });
    for (const ev of evs) {
      stats.scanned += 1;
      const googleEventId = ev.id ?? "";
      if (!googleEventId) {
        stats.skipped += 1;
        continue;
      }
      const pre = await prisma.googleCalendarEventRecord.findUnique({
        where: {
          calendarSourceId_googleEventId: { calendarSourceId: input.calendarSourceId, googleEventId },
        },
        select: { id: true },
      });
      const priv = calendarEventIsPrivate(ev);
      const summary =
        priv && !input.includePrivateDetails ? "Private event" : (ev.summary ?? "(no title)");
      const description = priv && !input.includePrivateDetails ? null : (ev.description ?? null);
      const attendees = priv && !input.includePrivateDetails ? null : (ev.attendees ?? null);
      const campaignLink = await prisma.campaignEvent.findFirst({
        where: { googleEventId },
        select: { id: true },
      });
      const row = await prisma.googleCalendarEventRecord.upsert({
        where: {
          calendarSourceId_googleEventId: { calendarSourceId: input.calendarSourceId, googleEventId },
        },
        create: {
          calendarSourceId: input.calendarSourceId,
          googleEventId,
          recurringEventId: ev.recurringEventId ?? null,
          iCalUID: ev.iCalUID ?? null,
          status: ev.status ?? null,
          summary,
          description,
          location: ev.location ?? null,
          organizerEmail: ev.organizer?.email?.toLowerCase() ?? null,
          creatorEmail: ev.creator?.email?.toLowerCase() ?? null,
          startAt: ev.start?.dateTime ? new Date(ev.start.dateTime) : ev.start?.date ? new Date(ev.start.date) : null,
          endAt: ev.end?.dateTime ? new Date(ev.end.dateTime) : ev.end?.date ? new Date(ev.end.date) : null,
          allDay: Boolean(ev.start?.date && !ev.start?.dateTime),
          timezone: ev.start?.timeZone ?? null,
          attendeesJson: attendees as unknown as Prisma.InputJsonValue,
          visibility: ev.visibility ?? null,
          htmlLink: ev.htmlLink ?? null,
          updatedGoogleAt: ev.updated ? new Date(ev.updated) : null,
          providerAccountEmail: input.providerAccountEmail,
          ingestRunId: input.ingestRunId,
          privacyRedacted: priv,
          campaignEventId: campaignLink?.id ?? null,
        },
        update: {
          recurringEventId: ev.recurringEventId ?? null,
          iCalUID: ev.iCalUID ?? null,
          status: ev.status ?? null,
          summary,
          description,
          location: ev.location ?? null,
          organizerEmail: ev.organizer?.email?.toLowerCase() ?? null,
          creatorEmail: ev.creator?.email?.toLowerCase() ?? null,
          startAt: ev.start?.dateTime ? new Date(ev.start.dateTime) : ev.start?.date ? new Date(ev.start.date) : null,
          endAt: ev.end?.dateTime ? new Date(ev.end.dateTime) : ev.end?.date ? new Date(ev.end.date) : null,
          allDay: Boolean(ev.start?.date && !ev.start?.dateTime),
          timezone: ev.start?.timeZone ?? null,
          attendeesJson: attendees as unknown as Prisma.InputJsonValue,
          visibility: ev.visibility ?? null,
          htmlLink: ev.htmlLink ?? null,
          updatedGoogleAt: ev.updated ? new Date(ev.updated) : null,
          ingestRunId: input.ingestRunId,
          privacyRedacted: priv,
          campaignEventId: campaignLink?.id ?? undefined,
        },
      });
      if (pre) stats.updated += 1;
      else stats.created += 1;

      await prisma.googleCalendarEventParticipant.deleteMany({ where: { googleCalendarEventRecordId: row.id } });
      if (attendees) {
        for (const a of attendees) {
          const em = a.email?.trim().toLowerCase();
          if (!em) continue;
          const ident = await ensureCommunicationIdentityForEmail({
            normalizedEmail: em,
            displayName: a.displayName ?? null,
          });
          if (ident.created) stats.identitiesCreated += 1;
          await prisma.googleCalendarEventParticipant.create({
            data: {
              googleCalendarEventRecordId: row.id,
              role: "ATTENDEE",
              email: em,
              displayName: a.displayName ?? null,
              responseStatus: a.responseStatus ?? null,
              optional: a.optional ?? null,
              normalizedEmail: normalizeEmail(em),
              communicationIdentityId: ident.id,
            },
          });
          if (!ident.suppressed) {
            for (const d of deriveSignalsFromCalendarAttendee({
              normalizedEmail: normalizeEmail(em),
              displayName: a.displayName ?? null,
              googleEventId,
            })) {
              await prisma.communicationIdentitySignal.create({
                data: {
                  communicationIdentityId: ident.id,
                  source: d.source as CommunicationIdentitySignalSource,
                  signalType: d.signalType,
                  value: d.value,
                  confidence: d.confidence,
                  evidenceJson: d.evidenceJson as Prisma.InputJsonValue,
                  approvedForAudienceUse: false,
                },
              });
            }
          }
        }
      }
    }
  } catch {
    stats.errors += 1;
  }
  return stats;
}
