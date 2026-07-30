/**
 * Local-first public site copy overrides (Phase 1 site edit mode).
 * Prefer Unknown / never invent claims. Full website workbench later.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export const SITE_COPY_OVERRIDES_REL = "data/site-edit/copy-overrides.json";

export type SiteCopyOverridesStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  /** Dot keys e.g. home.hero.promise → string */
  overrides: Record<string, string>;
};

function storePath(): string {
  return path.join(process.cwd(), SITE_COPY_OVERRIDES_REL);
}

export function emptySiteCopyOverrides(): SiteCopyOverridesStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Public site copy overrides from edit mode — Prefer Unknown; no invented claims.",
    overrides: {},
  };
}

export function loadSiteCopyOverrides(): SiteCopyOverridesStore {
  const p = storePath();
  if (!existsSync(p)) return emptySiteCopyOverrides();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as SiteCopyOverridesStore;
    if (!raw || typeof raw !== "object") return emptySiteCopyOverrides();
    return {
      ...emptySiteCopyOverrides(),
      ...raw,
      version: 1,
      overrides: raw.overrides && typeof raw.overrides === "object" ? raw.overrides : {},
    };
  } catch {
    return emptySiteCopyOverrides();
  }
}

export function saveSiteCopyOverrides(store: SiteCopyOverridesStore): void {
  const p = storePath();
  mkdirSync(path.dirname(p), { recursive: true });
  const next: SiteCopyOverridesStore = {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(p, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export function resolveSiteCopy(key: string, fallback: string): string {
  const v = loadSiteCopyOverrides().overrides[key];
  if (typeof v === "string" && v.trim()) return v;
  return fallback;
}

export function setSiteCopyOverride(key: string, value: string): SiteCopyOverridesStore {
  const store = loadSiteCopyOverrides();
  const k = String(key ?? "").trim();
  const val = String(value ?? "");
  if (!k) return store;
  if (!val.trim()) {
    delete store.overrides[k];
  } else {
    store.overrides[k] = val;
  }
  saveSiteCopyOverrides(store);
  return store;
}

/**
 * Well-known keys (homepage + MediaPageHero string fields).
 * MediaPageHero also resolves `${slotKey}.eyebrow|title|subtitle` dynamically for any string props.
 */
export const SITE_EDIT_COPY_KEYS = [
  "home.hero.brand",
  "home.hero.office",
  "home.hero.promise",
  "home.hero.body",
  "home.hero.ctaPrimary",
  "home.hero.ctaSecondary",
  "about.hero.eyebrow",
  "about.hero.title",
  "about.hero.subtitle",
  "priorities.hero.eyebrow",
  "priorities.hero.title",
  "priorities.hero.subtitle",
  "speaks.hero.eyebrow",
  "speaks.hero.title",
  "speaks.hero.subtitle",
  "campaign-photos.intro.eyebrow",
  "campaign-photos.intro.title",
  "campaign-photos.intro.subtitle",
  "road.hero.eyebrow",
  "road.hero.title",
  "road.hero.subtitle",
  "endorsements.hero.eyebrow",
  "endorsements.hero.title",
  "endorsements.hero.subtitle",
  "events.hero.eyebrow",
  "events.hero.title",
  "events.hero.subtitle",
  "listening.hero.eyebrow",
  "listening.hero.title",
  "listening.hero.subtitle",
  "get-involved.hero.eyebrow",
  "get-involved.hero.title",
  "get-involved.hero.subtitle",
  "donate.hero.eyebrow",
  "donate.hero.title",
  "donate.hero.subtitle",
  "contact.hero.eyebrow",
  "contact.hero.title",
  "contact.hero.subtitle",
  "arkansas.hero.eyebrow",
  "arkansas.hero.title",
  "arkansas.hero.subtitle",
  "host-gathering.hero.eyebrow",
  "host-gathering.hero.title",
  "host-gathering.hero.subtitle",
  "local-team.hero.eyebrow",
  "local-team.hero.title",
  "local-team.hero.subtitle",
  "journey.hero.eyebrow",
  "journey.hero.title",
  "journey.hero.subtitle",
  "community.hero.eyebrow",
  "community.hero.title",
  "community.hero.subtitle",
  "why.hero.eyebrow",
  "why.hero.title",
  "why.hero.subtitle",
  "schedule.hero.eyebrow",
  "schedule.hero.title",
  "schedule.hero.subtitle",
  "press.hero.eyebrow",
  "press.hero.title",
  "press.hero.subtitle",
  "dd.hero.eyebrow",
  "dd.hero.title",
  "dd.hero.subtitle",
] as const;

export type SiteEditCopyKey = (typeof SITE_EDIT_COPY_KEYS)[number];
