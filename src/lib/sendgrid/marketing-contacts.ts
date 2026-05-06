import "server-only";

/**
 * EMAIL-SENDGRID-CONTACT-UPsert-EXECUTION-1.2 — SendGrid Marketing Contacts API (management only).
 * Upserts contacts; does not send email, create campaigns, schedule sends, or activate automations.
 */

const MARKETING_CONTACTS_URL = "https://api.sendgrid.com/v3/marketing/contacts";
const IMPORT_STATUS_URL = (jobId: string) =>
  `https://api.sendgrid.com/v3/marketing/contacts/imports/${encodeURIComponent(jobId)}`;

/** SendGrid accepts large batches; keep chunks conservative for timeouts and error isolation. */
const UPSERT_CHUNK_SIZE = 1000;

export type SendGridMarketingContactsReadiness = {
  sendgridApiKeyConfigured: boolean;
  contactUpsertAvailable: boolean;
  notes: string[];
};

export type SendGridMarketingContactPayload = {
  email: string;
};

export type SendGridMarketingUpsertBatchResult = {
  statusCode: number;
  jobId: string | null;
};

export type UpsertSendGridMarketingContactsOutcome =
  | {
      ok: true;
      batches: SendGridMarketingUpsertBatchResult[];
      totalSubmitted: number;
    }
  | { ok: false; statusCode?: number; safeMessage: string };

export type SendGridContactImportStatusResult =
  | { ok: true; status: string | null; rawSummary: Record<string, unknown> }
  | { ok: false; safeMessage: string };

export function getSendGridMarketingContactsReadiness(): SendGridMarketingContactsReadiness {
  const sendgridApiKeyConfigured = Boolean(process.env.SENDGRID_API_KEY?.trim());
  return {
    sendgridApiKeyConfigured,
    contactUpsertAvailable: sendgridApiKeyConfigured,
    notes: sendgridApiKeyConfigured
      ? [
          "Marketing Contacts API (PUT /v3/marketing/contacts) is available for contact upserts only — this does not send email.",
        ]
      : ["SENDGRID_API_KEY is not set — Marketing Contacts upsert execution is blocked."],
  };
}

/**
 * Build a single-contact payload for Marketing Contacts upsert.
 * Custom fields are omitted unless SendGrid field definitions are explicitly provisioned and approved for this lane.
 */
export function buildSendGridMarketingContactPayload(contact: { email: string }): SendGridMarketingContactPayload {
  const email = contact.email.trim().toLowerCase();
  return { email };
}

/** UUID v1–v5 shape — SendGrid marketing list IDs use this form. */
export function sendGridMarketingListIdLooksValid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

function resolveMarketingListIds(explicit?: string[] | null): string[] | undefined {
  const out = new Set<string>();
  for (const id of explicit ?? []) {
    if (sendGridMarketingListIdLooksValid(id)) out.add(id.trim());
  }
  const envList = process.env.SENDGRID_DEFAULT_LIST_ID?.trim();
  if (envList && sendGridMarketingListIdLooksValid(envList)) out.add(envList);
  if (out.size === 0) return undefined;
  return [...out];
}

function readSendGridApiKey(): string | null {
  const k = process.env.SENDGRID_API_KEY?.trim();
  return k || null;
}

export function sanitizeSendGridApiError(error: unknown): string {
  if (error instanceof Error && error.message) {
    const m = error.message.trim();
    if (m.length > 240) return `${m.slice(0, 240)}…`;
    return m;
  }
  return "SendGrid request failed.";
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractErrorsMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const errors = o.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;
  const first = errors[0];
  if (first && typeof first === "object" && "message" in first) {
    const msg = (first as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg.trim().slice(0, 400);
  }
  return "SendGrid returned an error response.";
}

/**
 * Upsert contacts via SendGrid Marketing Contacts API (PUT /v3/marketing/contacts).
 * No sends, no campaigns, no schedules.
 */
export async function upsertSendGridMarketingContacts(args: {
  contacts: SendGridMarketingContactPayload[];
  listIds?: string[] | null;
}): Promise<UpsertSendGridMarketingContactsOutcome> {
  const apiKey = readSendGridApiKey();
  if (!apiKey) {
    return { ok: false, safeMessage: "SENDGRID_API_KEY is not configured — contact upsert blocked." };
  }
  if (args.contacts.length === 0) {
    return { ok: true, batches: [], totalSubmitted: 0 };
  }

  const list_ids = resolveMarketingListIds(args.listIds ?? undefined);
  const batches: SendGridMarketingUpsertBatchResult[] = [];
  let totalSubmitted = 0;

  for (let i = 0; i < args.contacts.length; i += UPSERT_CHUNK_SIZE) {
    const slice = args.contacts.slice(i, i + UPSERT_CHUNK_SIZE);
    const body: Record<string, unknown> = { contacts: slice };
    if (list_ids?.length) body.list_ids = list_ids;

    const res = await fetch(MARKETING_CONTACTS_URL, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const statusCode = res.status;
    const parsed = safeJsonParse(await res.text());

    if (!res.ok) {
      const msg = extractErrorsMessage(parsed) ?? `SendGrid returned HTTP ${statusCode}.`;
      return { ok: false, statusCode, safeMessage: sanitizeSendGridApiError(new Error(msg)) };
    }

    let jobId: string | null = null;
    if (parsed && typeof parsed === "object" && "job_id" in parsed) {
      const j = (parsed as { job_id?: unknown }).job_id;
      if (typeof j === "string" && j.trim()) jobId = j.trim();
    }

    batches.push({ statusCode, jobId });
    totalSubmitted += slice.length;
  }

  return { ok: true, batches, totalSubmitted };
}

/**
 * Best-effort import job status (Marketing Contacts async jobs).
 */
export async function getSendGridContactImportStatus(jobId: string): Promise<SendGridContactImportStatusResult> {
  const apiKey = readSendGridApiKey();
  if (!apiKey) {
    return { ok: false, safeMessage: "SENDGRID_API_KEY is not configured." };
  }
  const id = jobId.trim();
  if (!id) {
    return { ok: false, safeMessage: "Missing job id." };
  }

  const res = await fetch(IMPORT_STATUS_URL(id), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await res.text();
  const parsed = safeJsonParse(text);

  if (!res.ok) {
    const msg = extractErrorsMessage(parsed) ?? `SendGrid import status HTTP ${res.status}.`;
    return { ok: false, safeMessage: sanitizeSendGridApiError(new Error(msg)) };
  }

  let status: string | null = null;
  if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    if (typeof o.status === "string") status = o.status;
  }

  const rawSummary: Record<string, unknown> = {};
  if (parsed && typeof parsed === "object") {
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === null) {
        rawSummary[k] = v as string | number | boolean | null;
      }
    }
  }

  return { ok: true, status, rawSummary };
}
