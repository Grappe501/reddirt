import { createHash } from "node:crypto";

/** Stable slug for vault folder names (ASCII). */
export function countySlug(county: string): string {
  return (
    county
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "unknown-county"
  );
}

export function eventFolderSlug(title: string, startIso: string): string {
  const day = startIso.slice(0, 10);
  const h = createHash("sha256").update(`${day}|${title}`).digest("hex").slice(0, 10);
  const t = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${day}-${t || "event"}-${h}`;
}

export function countyVaultRootRel(): string {
  return "county-vault/arkansas";
}

export function countyVaultCountyRel(county: string): string {
  return `${countyVaultRootRel()}/${countySlug(county)}`;
}

export function countyVaultEventRel(county: string, title: string, startIso: string): string {
  return `${countyVaultCountyRel(county)}/events/${eventFolderSlug(title, startIso)}`;
}
