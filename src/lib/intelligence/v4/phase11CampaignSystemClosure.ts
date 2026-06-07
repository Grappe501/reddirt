/**
 * Phase 11 (P0) — Campaign system manual surfacing closure metrics.
 */
import fs from "node:fs";
import path from "node:path";
import {
  buildCampaignSystemManualInventory,
  listCampaignSystemCategoryGuides,
  isPriorityCampaignSystemPath,
} from "@/lib/intelligence/v4/campaignSystemManualInventory";
import {
  CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
  categoryIdFromRelativePath,
  type CampaignSystemCategoryId,
} from "@/lib/campaign-strategy/campaign-system-nav";
import { CAMPAIGN_SYSTEM_MANUAL_DIR } from "@/lib/campaign-strategy/md-manifest";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_TOTAL_FILES = 250;
const MIN_CATEGORIES = 8;
const MIN_CATEGORY_GUIDES = 8;
const MIN_PRIORITY_PATHS = 12;
const MIN_MIGRATION_ROUTES = 38;

function countCampaignSystemMarkdownSync(): number {
  let count = 0;
  const root = path.join(process.cwd(), CAMPAIGN_SYSTEM_MANUAL_DIR);

  function walk(dir: string): void {
    for (const ent of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      const rel = dir ? `${dir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(rel);
      else if (ent.name.toLowerCase().endsWith(".md")) count++;
    }
  }

  walk("");
  return count;
}

function countCategoriesSync(): Record<CampaignSystemCategoryId, number> {
  const counts = {} as Record<CampaignSystemCategoryId, number>;
  const root = path.join(process.cwd(), CAMPAIGN_SYSTEM_MANUAL_DIR);

  function walk(dir: string): void {
    for (const ent of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      const rel = dir ? `${dir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(rel);
      else if (ent.name.toLowerCase().endsWith(".md")) {
        const cat = categoryIdFromRelativePath(rel);
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
  }

  walk("");
  return counts;
}

function buildPhase11ProgressFromCounts(totalFiles: number, categoryCounts: Record<CampaignSystemCategoryId, number>): Phase11CampaignSystemProgress {
  const guides = listCampaignSystemCategoryGuides();
  const priorityInInventory = guides.flatMap((g) => g.priorityPathKeys).filter((pk) =>
    isPriorityCampaignSystemPath(pk),
  ).length;

  const categoriesWithFiles = Object.values(categoryCounts).filter((n) => n > 0).length;

  const fieldBookArticleReady = Boolean(getFieldBookArticle("campaign-system-manual-command"));
  const canonBindingReady = Boolean(resolveCanonBinding(CAMPAIGN_SYSTEM_MANUAL_HUB_HREF));
  const migrationRoutes = listStrategyMigrationRoutes();
  const migrationRouteBound = migrationRoutes.some(
    (r) => r.intelligenceHref === CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
  );

  const fileScore =
    totalFiles >= MIN_TOTAL_FILES ? 100 : Math.round((totalFiles / MIN_TOTAL_FILES) * 100);
  const catScore =
    categoriesWithFiles >= MIN_CATEGORIES ? 100 : Math.round((categoriesWithFiles / MIN_CATEGORIES) * 100);
  const guideScore =
    guides.length >= MIN_CATEGORY_GUIDES ? 100 : Math.round((guides.length / MIN_CATEGORY_GUIDES) * 100);
  const priorityScore =
    priorityInInventory >= MIN_PRIORITY_PATHS
      ? 100
      : Math.round((priorityInInventory / MIN_PRIORITY_PATHS) * 100);
  const wireScore =
    fieldBookArticleReady && canonBindingReady && migrationRouteBound ? 100 : 50;

  const overallPct = Math.min(
    100,
    Math.round((fileScore + catScore + guideScore + priorityScore + wireScore) / 5),
  );

  return {
    totalFiles,
    categoriesWithFiles,
    categoryGuideCount: guides.length,
    priorityPathsInInventory: priorityInInventory,
    hubRouteReady: true,
    fieldBookArticleReady,
    canonBindingReady,
    migrationRouteBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export function computePhase11CampaignSystemProgressSync(): Phase11CampaignSystemProgress {
  return buildPhase11ProgressFromCounts(countCampaignSystemMarkdownSync(), countCategoriesSync());
}

export function computePhase11UpgradePassSync(): Phase11UpgradePassReport {
  const progress = computePhase11CampaignSystemProgressSync();
  return {
    passId: "phase-11-campaign-system-surfacing",
    title: "Step 11 — Phase 11 (P0): Campaign system manual surfacing",
    summary:
      "252-file campaign system manual surfaced in intelligence tree — category inventory, browsable reader, priority tome guides, and strategy command cross-links. Unblocks Field Book promotion batches from hidden agent-only chunks.",
    completionPct: progress.overallPct,
    hubHref: CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
    progress,
  };
}

export type Phase11CampaignSystemProgress = {
  totalFiles: number;
  categoriesWithFiles: number;
  categoryGuideCount: number;
  priorityPathsInInventory: number;
  hubRouteReady: boolean;
  fieldBookArticleReady: boolean;
  canonBindingReady: boolean;
  migrationRouteBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export async function computePhase11CampaignSystemProgress(): Promise<Phase11CampaignSystemProgress> {
  const inventory = await buildCampaignSystemManualInventory();
  return buildPhase11ProgressFromCounts(inventory.totalFiles, inventory.categoryCounts);
}

export type Phase11UpgradePassReport = {
  passId: "phase-11-campaign-system-surfacing";
  title: "Step 11 — Phase 11 (P0): Campaign system manual surfacing";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11CampaignSystemProgress;
};

export async function computePhase11UpgradePass(): Promise<Phase11UpgradePassReport> {
  const progress = await computePhase11CampaignSystemProgress();
  return {
    passId: "phase-11-campaign-system-surfacing",
    title: "Step 11 — Phase 11 (P0): Campaign system manual surfacing",
    summary:
      "252-file campaign system manual surfaced in intelligence tree — category inventory, browsable reader, priority tome guides, and strategy command cross-links. Unblocks Field Book promotion batches from hidden agent-only chunks.",
    completionPct: progress.overallPct,
    hubHref: CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
    progress,
  };
}

export async function assertPhase11CampaignSystemBar(): Promise<{ ok: boolean; message: string }> {
  const p = await computePhase11CampaignSystemProgress();
  return assertPhase11FromProgress(p);
}

export function assertPhase11CampaignSystemBarSync(): { ok: boolean; message: string } {
  return assertPhase11FromProgress(computePhase11CampaignSystemProgressSync());
}

function assertPhase11FromProgress(p: Phase11CampaignSystemProgress): { ok: boolean; message: string } {

  if (p.totalFiles < MIN_TOTAL_FILES) {
    return { ok: false, message: `Files discovered ${p.totalFiles}/${MIN_TOTAL_FILES}` };
  }
  if (p.categoriesWithFiles < MIN_CATEGORIES) {
    return { ok: false, message: `Categories ${p.categoriesWithFiles}/${MIN_CATEGORIES}` };
  }
  if (p.categoryGuideCount < MIN_CATEGORY_GUIDES) {
    return { ok: false, message: `Category guides ${p.categoryGuideCount}/${MIN_CATEGORY_GUIDES}` };
  }
  if (!p.fieldBookArticleReady) {
    return { ok: false, message: "Missing Field Book campaign-system-manual-command article" };
  }
  if (!p.canonBindingReady) {
    return { ok: false, message: "Missing canon binding on campaign-system-manual hub" };
  }
  if (!p.migrationRouteBound) {
    return { ok: false, message: "Missing strategy migration bridge route" };
  }

  return { ok: true, message: `Phase 11 campaign system surfacing ${p.overallPct}% at bar` };
}

export type { CampaignSystemCategoryId };
