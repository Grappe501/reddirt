/**
 * Read-only Google Calendar preview for admin Calendar HQ.
 * Uses calendarList.list + events.list only — no inserts, updates, deletes, watches, or sync token writes.
 */
import type { CalendarSource } from "@prisma/client";
import type { calendar_v3 } from "@googleapis/calendar";
import { getCalendarApiForSource } from "@/lib/integrations/google/calendar";
import { getGoogleCalendarEnv, isGoogleCalendarConfigured } from "@/lib/calendar/env";

type OAuthJson = { refresh_token?: string; access_token?: string; expiry_date?: number };

export type GoogleCalendarEnvRow = {
  /** Env var name(s) — no values. */
  label: string;
  ok: boolean;
  hint: string;
};

export type CalendarSourcePreviewRow = {
  id: string;
  label: string;
  displayName: string | null;
  externalCalendarId: string;
  hasOAuthRefreshToken: boolean;
  isActive: boolean;
  syncEnabled: boolean;
  eventCount: number;
};

export type GoogleCalendarListRow = { id: string | null | undefined; summary: string | null | undefined };

export type GoogleCalendarEventPreviewRow = {
  id: string | null | undefined;
  summary: string;
  startLabel: string;
  endLabel: string;
  htmlLink: string | null | undefined;
};

export type GoogleCalendarLivePreviewResult =
  | {
      kind: "not_configured";
      envRows: GoogleCalendarEnvRow[];
      sources: CalendarSourcePreviewRow[];
    }
  | {
      kind: "no_sources";
      envRows: GoogleCalendarEnvRow[];
    }
  | {
      kind: "no_token_source";
      envRows: GoogleCalendarEnvRow[];
      sources: CalendarSourcePreviewRow[];
    }
  | {
      kind: "invalid_preview_source";
      envRows: GoogleCalendarEnvRow[];
      sources: CalendarSourcePreviewRow[];
      requestedId: string;
    }
  | {
      kind: "reauth_needed";
      envRows: GoogleCalendarEnvRow[];
      sources: CalendarSourcePreviewRow[];
      selectedSourceId: string;
      selectedLabel: string;
      hint: string;
    }
  | {
      kind: "api_error";
      envRows: GoogleCalendarEnvRow[];
      sources: CalendarSourcePreviewRow[];
      selectedSourceId: string;
      selectedLabel: string;
      hint: string;
    }
  | {
      kind: "empty_upcoming";
      envRows: GoogleCalendarEnvRow[];
      sources: CalendarSourcePreviewRow[];
      selectedSourceId: string;
      selectedLabel: string;
      externalCalendarId: string;
      calendarListSample: GoogleCalendarListRow[];
    }
  | {
      kind: "success";
      envRows: GoogleCalendarEnvRow[];
      sources: CalendarSourcePreviewRow[];
      selectedSourceId: string;
      selectedLabel: string;
      externalCalendarId: string;
      calendarListSample: GoogleCalendarListRow[];
      events: GoogleCalendarEventPreviewRow[];
    };

function oauthHasRefreshToken(oauthJson: unknown): boolean {
  const o = (oauthJson ?? {}) as OAuthJson;
  return Boolean(o.refresh_token && String(o.refresh_token).trim().length > 0);
}

function mapEventDateTime(dt: calendar_v3.Schema$EventDateTime | null | undefined): string {
  if (!dt) return "—";
  if (dt.dateTime) {
    try {
      return new Date(dt.dateTime).toLocaleString("en-US", { timeZone: dt.timeZone ?? undefined });
    } catch {
      return dt.dateTime;
    }
  }
  if (dt.date) return `${dt.date} (all-day)`;
  return "—";
}

function classifyGoogleError(err: unknown): { hint: string; reauth: boolean } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (lower.includes("invalid_grant") || lower.includes("invalid credentials")) {
    return {
      reauth: true,
      hint: "Google rejected the refresh token (expired or revoked). Re-connect this calendar source via OAuth.",
    };
  }
  if (lower.includes("no refresh_token")) {
    return { reauth: true, hint: "Complete Google Calendar OAuth for this source so a refresh token is stored." };
  }
  const g = err as { code?: number | string; response?: { status?: number } };
  const status = typeof g.response?.status === "number" ? g.response.status : undefined;
  if (status === 401 || g.code === 401) {
    return { reauth: true, hint: "Unauthorized (401). Tokens may be invalid — try reconnecting OAuth for this calendar source." };
  }
  if (status === 403 || g.code === 403) {
    return {
      reauth: false,
      hint: "Forbidden (403). The Google account may lack access to this calendar, or the API project is restricted.",
    };
  }
  if (status === 404 || g.code === 404) {
    return {
      reauth: false,
      hint: "Not found (404). Check that external calendar id on the source matches a calendar the account can see.",
    };
  }
  if (status === 429 || g.code === 429) {
    return { reauth: false, hint: "Rate limited (429). Wait briefly and reload." };
  }
  return {
    reauth: false,
    hint: "Google Calendar API returned an error. Details are not shown here (no secrets). Check Cloud Console quotas and calendar access.",
  };
}

export function buildGoogleCalendarEnvRows(): GoogleCalendarEnvRow[] {
  const e = getGoogleCalendarEnv();
  const idOk = Boolean(e.clientId);
  const secretOk = Boolean(e.clientSecret);
  const redirectOk = Boolean(e.redirectUri);
  return [
    {
      label: "GOOGLE_CALENDAR_CLIENT_ID (or GOOGLE_GMAIL_CLIENT_ID / GOOGLE_CLIENT_ID)",
      ok: idOk,
      hint: idOk ? "Present" : "Missing — set a Google OAuth client id for Calendar.",
    },
    {
      label: "GOOGLE_CALENDAR_CLIENT_SECRET (or GOOGLE_GMAIL_CLIENT_SECRET / GOOGLE_CLIENT_SECRET)",
      ok: secretOk,
      hint: secretOk ? "Present" : "Missing — set the matching client secret.",
    },
    {
      label: "GOOGLE_CALENDAR_REDIRECT_URI (or NEXT_PUBLIC_SITE_URL for default callback)",
      ok: redirectOk,
      hint: redirectOk ? "Present" : "Missing — set redirect URI or NEXT_PUBLIC_SITE_URL so the OAuth callback URL is valid.",
    },
  ];
}

export function toCalendarSourcePreviewRows(
  sources: (CalendarSource & { _count?: { events: number } })[]
): CalendarSourcePreviewRow[] {
  return sources.map((s) => ({
    id: s.id,
    label: s.label,
    displayName: s.displayName,
    externalCalendarId: s.externalCalendarId,
    hasOAuthRefreshToken: oauthHasRefreshToken(s.oauthJson),
    isActive: s.isActive,
    syncEnabled: s.syncEnabled,
    eventCount: s._count?.events ?? 0,
  }));
}

function pickSource(
  sources: CalendarSource[],
  previewSourceId: string | null | undefined
): CalendarSource | null {
  const withToken = sources.filter((s) => oauthHasRefreshToken(s.oauthJson));
  if (previewSourceId?.trim()) {
    const hit = withToken.find((s) => s.id === previewSourceId.trim());
    return hit ?? null;
  }
  const active = withToken.filter((s) => s.isActive);
  return active[0] ?? withToken[0] ?? null;
}

/**
 * Live Google Calendar read preview (admin only). Does not mutate DB or Google state.
 */
export async function loadGoogleCalendarLivePreview(params: {
  sources: (CalendarSource & { _count?: { events: number } })[];
  previewSourceId?: string | null;
}): Promise<GoogleCalendarLivePreviewResult> {
  const envRows = buildGoogleCalendarEnvRows();
  const rows = toCalendarSourcePreviewRows(params.sources);

  if (!isGoogleCalendarConfigured()) {
    return { kind: "not_configured", envRows, sources: rows };
  }

  if (params.sources.length === 0) {
    return { kind: "no_sources", envRows };
  }

  const previewId = params.previewSourceId?.trim() || null;
  const withToken = params.sources.filter((s) => oauthHasRefreshToken(s.oauthJson));

  if (withToken.length === 0) {
    return { kind: "no_token_source", envRows, sources: rows };
  }

  if (previewId) {
    const exists = withToken.some((s) => s.id === previewId);
    if (!exists) {
      return { kind: "invalid_preview_source", envRows, sources: rows, requestedId: previewId };
    }
  }

  const selected = pickSource(params.sources, previewId);
  if (!selected) {
    return { kind: "no_token_source", envRows, sources: rows };
  }

  const selectedLabel = selected.displayName?.trim() || selected.label;
  let cal;
  try {
    cal = getCalendarApiForSource(selected);
  } catch (e) {
    const { hint, reauth } = classifyGoogleError(e);
    if (reauth) {
      return {
        kind: "reauth_needed",
        envRows,
        sources: rows,
        selectedSourceId: selected.id,
        selectedLabel,
        hint,
      };
    }
    return {
      kind: "api_error",
      envRows,
      sources: rows,
      selectedSourceId: selected.id,
      selectedLabel,
      hint,
    };
  }

  let calendarListSample: GoogleCalendarListRow[] = [];
  try {
    const listRes = await cal.calendarList.list({ maxResults: 15 });
    calendarListSample =
      listRes.data.items?.map((it) => ({ id: it.id, summary: it.summary ?? it.id ?? "(no title)" })) ?? [];
  } catch (e) {
    const { hint, reauth } = classifyGoogleError(e);
    if (reauth) {
      return {
        kind: "reauth_needed",
        envRows,
        sources: rows,
        selectedSourceId: selected.id,
        selectedLabel,
        hint,
      };
    }
    return {
      kind: "api_error",
      envRows,
      sources: rows,
      selectedSourceId: selected.id,
      selectedLabel,
      hint,
    };
  }

  try {
    const timeMin = new Date().toISOString();
    const evRes = await cal.events.list({
      calendarId: selected.externalCalendarId,
      timeMin,
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });
    const items = evRes.data.items ?? [];
    if (items.length === 0) {
      return {
        kind: "empty_upcoming",
        envRows,
        sources: rows,
        selectedSourceId: selected.id,
        selectedLabel,
        externalCalendarId: selected.externalCalendarId,
        calendarListSample,
      };
    }
    const events: GoogleCalendarEventPreviewRow[] = items.map((ev) => ({
      id: ev.id,
      summary: ev.summary?.trim() || "(no title)",
      startLabel: mapEventDateTime(ev.start),
      endLabel: mapEventDateTime(ev.end),
      htmlLink: ev.htmlLink,
    }));
    return {
      kind: "success",
      envRows,
      sources: rows,
      selectedSourceId: selected.id,
      selectedLabel,
      externalCalendarId: selected.externalCalendarId,
      calendarListSample,
      events,
    };
  } catch (e) {
    const { hint, reauth } = classifyGoogleError(e);
    if (reauth) {
      return {
        kind: "reauth_needed",
        envRows,
        sources: rows,
        selectedSourceId: selected.id,
        selectedLabel,
        hint,
      };
    }
    return {
      kind: "api_error",
      envRows,
      sources: rows,
      selectedSourceId: selected.id,
      selectedLabel,
      hint,
    };
  }
}
