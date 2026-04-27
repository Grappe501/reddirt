import type { HeroBlockPayload, PageKey } from "@/lib/content/page-blocks";

const HERO_DRAFT_PREFIX = "kelly_hero_draft_v1_";

export function pageHeroDraftStorageKey(pageKey: PageKey | string): string {
  return `${HERO_DRAFT_PREFIX}${pageKey}`;
}

export type PageHeroLocalDraftV1 = {
  v: 1;
  eyebrow: string;
  title: string;
  subtitle: string;
  savedAt: string;
};

export function parsePageHeroLocalDraft(raw: string | null): PageHeroLocalDraftV1 | null {
  if (raw == null || raw === "") return null;
  try {
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return null;
    const o = p as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (typeof o.eyebrow !== "string" || typeof o.title !== "string" || typeof o.subtitle !== "string") return null;
    return {
      v: 1,
      eyebrow: o.eyebrow,
      title: o.title,
      subtitle: o.subtitle,
      savedAt: typeof o.savedAt === "string" ? o.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function pageHeroDraftDiffersFromInitial(draft: PageHeroLocalDraftV1, initial: HeroBlockPayload | null): boolean {
  const e = draft.eyebrow.trim();
  const t = draft.title.trim();
  const s = draft.subtitle.trim();
  const ie = (initial?.eyebrow ?? "").trim();
  const it = (initial?.title ?? "").trim();
  const isu = (initial?.subtitle ?? "").trim();
  return e !== ie || t !== it || s !== isu;
}

export const ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY = "kelly_ask_beta_feedback_draft_v1";

export type AskKellyBetaLocalDraftV1 = {
  v: 1;
  name: string;
  email: string;
  phone: string;
  category: string;
  pagePath: string;
  feedback: string;
  savedAt: string;
};

export function parseAskKellyBetaLocalDraft(raw: string | null): AskKellyBetaLocalDraftV1 | null {
  if (raw == null || raw === "") return null;
  try {
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return null;
    const o = p as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (
      typeof o.name !== "string" ||
      typeof o.email !== "string" ||
      typeof o.phone !== "string" ||
      typeof o.category !== "string" ||
      typeof o.pagePath !== "string" ||
      typeof o.feedback !== "string"
    ) {
      return null;
    }
    return {
      v: 1,
      name: o.name,
      email: o.email,
      phone: o.phone,
      category: o.category,
      pagePath: o.pagePath,
      feedback: o.feedback,
      savedAt: typeof o.savedAt === "string" ? o.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function askKellyDraftDiffersFromDefaults(
  draft: AskKellyBetaLocalDraftV1,
  defaultPagePath: string,
  defaultCategory: string,
): boolean {
  const d = draft;
  if (d.name.trim() !== "" || d.email.trim() !== "" || d.phone.trim() !== "" || d.feedback.trim() !== "") return true;
  if (d.category !== defaultCategory) return true;
  if (d.pagePath.trim() !== (defaultPagePath ?? "").trim()) return true;
  return false;
}
