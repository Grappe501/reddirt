import "server-only";

import type { OAuth2Client } from "google-auth-library";
import { people } from "@googleapis/people";

export type GoogleContactDto = {
  googleResourceName: string;
  etag: string | null;
  displayName: string | null;
  givenName: string | null;
  familyName: string | null;
  primaryEmail: string | null;
  emailsJson: unknown[];
  phonesJson: unknown[];
};

export async function listGooglePeopleConnectionsPage(input: {
  auth: OAuth2Client;
  pageSize: number;
  pageToken?: string;
}): Promise<{ people: GoogleContactDto[]; nextPageToken: string | undefined; rawError?: string }> {
  try {
    const peopleApi = people({ version: "v1", auth: input.auth });
    const res = await peopleApi.people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses,phoneNumbers,metadata",
      pageSize: Math.min(Math.max(input.pageSize, 1), 1000),
      pageToken: input.pageToken,
    });
    const connections = res.data.connections ?? [];
    const out: GoogleContactDto[] = [];
    for (const c of connections) {
      const meta = c.resourceName;
      if (!meta) continue;
      const names = c.names ?? [];
      const displayName = names[0]?.displayName ?? null;
      const givenName = names[0]?.givenName ?? null;
      const familyName = names[0]?.familyName ?? null;
      const emails = (c.emailAddresses ?? []).map((e) => ({ value: e.value, type: e.type }));
      const phones = (c.phoneNumbers ?? []).map((p) => ({ value: p.value, type: p.type }));
      const primary = emails.find((e) => e.value)?.value?.trim().toLowerCase() ?? null;
      out.push({
        googleResourceName: meta,
        etag: c.etag ?? null,
        displayName,
        givenName,
        familyName,
        primaryEmail: primary,
        emailsJson: emails,
        phonesJson: phones,
      });
    }
    return { people: out, nextPageToken: res.data.nextPageToken ?? undefined };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { people: [], nextPageToken: undefined, rawError: msg };
  }
}
