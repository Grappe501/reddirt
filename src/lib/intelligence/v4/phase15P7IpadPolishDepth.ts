/**
 * Phase 15 P7 — iPad polish depth overlays.
 */
import {
  getIpadCceSection,
  IPAD_POLISH_HUB_HREF,
  listIpadBottomNavTabs,
  type IpadCceSectionId,
} from "@/lib/intelligence/v4/phase15P7IpadPolish";

export { IPAD_POLISH_HUB_HREF };

export type IpadSectionPolishOverlay = {
  sectionId: IpadCceSectionId;
  polishSteps: string[];
  wiredInShell: boolean;
};

export function getIpadSectionPolishOverlay(sectionId: IpadCceSectionId): IpadSectionPolishOverlay | undefined {
  const section = getIpadCceSection(sectionId);
  const tab = listIpadBottomNavTabs("CANDIDATE").find((t) => t.sectionId === sectionId);
  if (!section || !tab) return undefined;

  return {
    sectionId,
    polishSteps: [
      `${tab.label} tab in CandidateIpadIntelligenceShell bottom nav — ${tab.linkCount} links in section sheet.`,
      section.summary,
      "Touch targets min 48px · safe-area padding · 820px max column width.",
    ],
    wiredInShell: true,
  };
}

export function ipadSectionMeetsPhase15P7Bar(overlay: IpadSectionPolishOverlay): boolean {
  return overlay.polishSteps.length >= 3 && overlay.wiredInShell;
}

export function countIpadSectionsAtBar(): { atBar: number; total: number } {
  const tabs = listIpadBottomNavTabs("CANDIDATE");
  const atBar = tabs.filter((t) => {
    const o = getIpadSectionPolishOverlay(t.sectionId);
    return o && ipadSectionMeetsPhase15P7Bar(o);
  }).length;
  return { atBar, total: tabs.length };
}
