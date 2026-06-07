/**
 * Phase 15 P7 — iPad polish: five-section CCE bottom nav for candidate deploy.
 */
import {
  buildCandidateCommandNavSections,
  type CandidateCommandNavSection,
} from "@/lib/intelligence/v4/candidateCommandNav";
import { CANDIDATE_COMMAND_HOME_HREF, PHASE15_P0_MAX_SECTIONS } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";

export const IPAD_POLISH_HUB_HREF = "/admin/intelligence/ipad-polish";

export const PHASE15_P7_IPAD_SECTION_TOTAL = 5;

export type IpadCceSectionId = "home" | "rehearse" | "philosophy" | "opposition" | "safety" | "operations";

export type IpadBottomNavTab = {
  sectionId: IpadCceSectionId;
  label: string;
  shortLabel: string;
  primaryHref: string;
  summary: string;
  linkCount: number;
};

const SHORT_LABELS: Record<string, string> = {
  home: "Home",
  rehearse: "Rehearse",
  philosophy: "Philosophy",
  opposition: "Opposition",
  safety: "Safety",
  operations: "Ops",
};

export function listIpadCceSections(
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE",
): CandidateCommandNavSection[] {
  return buildCandidateCommandNavSections(profile).slice(0, PHASE15_P0_MAX_SECTIONS);
}

export function listIpadBottomNavTabs(
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE",
): IpadBottomNavTab[] {
  return listIpadCceSections(profile).map((sec) => ({
    sectionId: sec.id as IpadCceSectionId,
    label: sec.label,
    shortLabel: SHORT_LABELS[sec.id] ?? sec.label.slice(0, 8),
    primaryHref: sec.links[0]?.href ?? CANDIDATE_COMMAND_HOME_HREF,
    summary: sec.summary,
    linkCount: sec.links.length,
  }));
}

export function getIpadCceSection(
  sectionId: string,
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE",
): CandidateCommandNavSection | undefined {
  return listIpadCceSections(profile).find((s) => s.id === sectionId);
}

export function resolveIpadActiveSectionId(
  pathname: string,
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE",
): IpadCceSectionId {
  const path = pathname.replace(/\/$/, "") || CANDIDATE_COMMAND_HOME_HREF;
  const sections = listIpadCceSections(profile);

  let best: { sectionId: IpadCceSectionId; hrefLen: number } | null = null;

  for (const sec of sections) {
    for (const link of sec.links) {
      const base = link.href.replace(/\/$/, "");
      const matches = path === base || path.startsWith(`${base}/`);
      if (!matches) continue;
      if (!best || base.length > best.hrefLen) {
        best = { sectionId: sec.id as IpadCceSectionId, hrefLen: base.length };
      }
    }
  }

  return best?.sectionId ?? "home";
}

export type IpadPolishSummary = {
  hubHref: string;
  sectionCount: number;
  bottomNavTabs: number;
  ipadModeActive: boolean;
  tonightReminder: string;
};

export function buildIpadPolishSummary(ipadModeActive = false): IpadPolishSummary {
  const tabs = listIpadBottomNavTabs("CANDIDATE");
  return {
    hubHref: IPAD_POLISH_HUB_HREF,
    sectionCount: tabs.length,
    bottomNavTabs: tabs.length,
    ipadModeActive,
    tonightReminder: ipadModeActive
      ? "iPad mode live — five CCE sections in bottom nav with touch-safe section sheets."
      : "Set NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true for Kelly stage-side deploy with five-section bottom nav.",
  };
}
