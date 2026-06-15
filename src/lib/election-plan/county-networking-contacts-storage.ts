import type { CountyNetworkingContact } from "@/lib/election-plan/county-networking-contacts-types";

export const COUNTY_NETWORKING_CONTACTS_STORAGE_KEY = "kgrappe-county-networking-contacts-v1";

export function loadCountyContacts(countySlug: string): CountyNetworkingContact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COUNTY_NETWORKING_CONTACTS_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, CountyNetworkingContact[]>;
    return all[countySlug] ?? [];
  } catch {
    return [];
  }
}

export function saveCountyContacts(countySlug: string, contacts: CountyNetworkingContact[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(COUNTY_NETWORKING_CONTACTS_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, CountyNetworkingContact[]>) : {};
    all[countySlug] = contacts;
    localStorage.setItem(COUNTY_NETWORKING_CONTACTS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
}

export function exportCountyContactsJson(countySlug: string, countyName: string): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      county: countyName,
      countySlug,
      contacts: loadCountyContacts(countySlug),
    },
    null,
    2,
  );
}

export function newContactId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
