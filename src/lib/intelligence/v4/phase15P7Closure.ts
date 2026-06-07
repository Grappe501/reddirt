/**
 * Phase 15 P7 — iPad polish closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { isCandidateIpadMode } from "@/lib/intelligence/candidateIpadMode";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildIpadPolishSummary,
  IPAD_POLISH_HUB_HREF,
  listIpadBottomNavTabs,
  PHASE15_P7_IPAD_SECTION_TOTAL,
} from "@/lib/intelligence/v4/phase15P7IpadPolish";
import {
  countIpadSectionsAtBar,
  getIpadSectionPolishOverlay,
  ipadSectionMeetsPhase15P7Bar,
} from "@/lib/intelligence/v4/phase15P7IpadPolishDepth";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase15P7Progress = {
  sectionTotal: number;
  sectionsAtBar: number;
  bottomNavTabs: number;
  shellUsesFiveSections: boolean;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  ipadEnvDocumented: boolean;
  overallPct: number;
};

export function computePhase15P7Progress(): Phase15P7Progress {
  const bar = countIpadSectionsAtBar();
  const tabs = listIpadBottomNavTabs("CANDIDATE");
  const summary = buildIpadPolishSummary(isCandidateIpadMode());

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(IPAD_POLISH_HUB_HREF);
  const shellUsesFiveSections = tabs.length === PHASE15_P7_IPAD_SECTION_TOTAL;
  const feed = buildCandidateCommandHomeFeed();
  const commandHomeWired = Boolean(feed.ipadPolish?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("ipad-polish-command"));
  const canonReady = Boolean(resolveCanonBinding(IPAD_POLISH_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === IPAD_POLISH_HUB_HREF,
  );
  const ipadEnvDocumented = summary.tonightReminder.includes("NEXT_PUBLIC_CANDIDATE_IPAD_MODE");

  const categoryScore =
    bar.total >= PHASE15_P7_IPAD_SECTION_TOTAL && shellUsesFiveSections ? 100 : 85;
  const barScore =
    bar.atBar >= PHASE15_P7_IPAD_SECTION_TOTAL
      ? 100
      : Math.round((bar.atBar / PHASE15_P7_IPAD_SECTION_TOTAL) * 100);
  const wireChecks = [hubInCandidateNav, commandHomeWired, shellUsesFiveSections, fieldBookReady, canonReady, migrationRouteBound, ipadEnvDocumented];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((categoryScore + barScore + wireScore) / 3));

  return {
    sectionTotal: bar.total,
    sectionsAtBar: bar.atBar,
    bottomNavTabs: tabs.length,
    shellUsesFiveSections,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    ipadEnvDocumented,
    overallPct,
  };
}

export type Phase15P7UpgradePassReport = {
  passId: "phase-15-p7-ipad-polish";
  title: "Step 15 P7 — iPad polish";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P7Progress;
};

export function computePhase15P7UpgradePass(): Phase15P7UpgradePassReport {
  const progress = computePhase15P7Progress();
  return {
    passId: "phase-15-p7-ipad-polish",
    title: "Step 15 P7 — iPad polish",
    summary:
      "Candidate iPad bottom nav aligned to five CCE sections — Home, Rehearse, Philosophy, Opposition, Safety — with touch-safe section sheets.",
    completionPct: progress.overallPct,
    hubHref: IPAD_POLISH_HUB_HREF,
    progress,
  };
}

export function assertPhase15P7Bar(): { ok: boolean; message: string } {
  const p = computePhase15P7Progress();
  const issues: string[] = [];
  if (p.sectionsAtBar < PHASE15_P7_IPAD_SECTION_TOTAL) {
    issues.push(`sections ${p.sectionsAtBar}/${PHASE15_P7_IPAD_SECTION_TOTAL}`);
  }
  if (!p.shellUsesFiveSections) issues.push(`tabs ${p.bottomNavTabs}`);
  if (!p.hubInCandidateNav) issues.push("nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const tab of listIpadBottomNavTabs("CANDIDATE")) {
    const o = getIpadSectionPolishOverlay(tab.sectionId);
    if (!o || !ipadSectionMeetsPhase15P7Bar(o)) issues.push(`overlay ${tab.sectionId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 15 P7 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { IPAD_POLISH_HUB_HREF };
