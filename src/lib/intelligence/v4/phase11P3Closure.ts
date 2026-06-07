/**
 * Phase 11 P3 — Strategy doctrine JSON surfacing closure.
 */
import {
  STRATEGY_DOCTRINE_HUB_HREF,
  STRATEGY_DOCTRINE_JSON_ENTRIES,
  strategyDoctrineDocHref,
} from "@/lib/strategy-doctrine/strategy-doctrine-nav";
import {
  countStrategyDoctrineArtifactsAtPhase11P3Bar,
  getStrategyDoctrineArtifactOverlay,
  strategyDoctrineArtifactMeetsPhase11P3Bar,
  PHASE11_P3_STRATEGY_DOCTRINE_ARTIFACT_TOTAL,
} from "@/lib/intelligence/v4/phase11P3StrategyDoctrineDepth";
import { loadCampaignStrategicDoctrineRegistry } from "@/lib/intelligence/campaignStrategicAlignment";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_ARTIFACTS = 9;
const MIN_AT_BAR = 9;

export type StrategyDoctrineArtifactSurface = {
  pathKey: string;
  title: string;
  href: string;
  sourceFile: string;
  category: string;
  phase11P3Enriched: boolean;
};

export type Phase11P3Progress = {
  artifactTotal: number;
  artifactsAtBar: number;
  registryDoctrineCount: number;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listStrategyDoctrineArtifactSurfaces(): StrategyDoctrineArtifactSurface[] {
  return STRATEGY_DOCTRINE_JSON_ENTRIES.map((e) => {
    const overlay = getStrategyDoctrineArtifactOverlay(e.pathKey);
    return {
      pathKey: e.pathKey,
      title: e.label,
      href: strategyDoctrineDocHref(e.pathKey),
      sourceFile: e.fileName,
      category: e.category,
      phase11P3Enriched: strategyDoctrineArtifactMeetsPhase11P3Bar(overlay),
    };
  });
}

export function computePhase11P3Progress(): Phase11P3Progress {
  const artifacts = countStrategyDoctrineArtifactsAtPhase11P3Bar();
  const registry = loadCampaignStrategicDoctrineRegistry();
  const migrationRoutes = listStrategyMigrationRoutes();

  const fieldBookReady = Boolean(getFieldBookArticle("strategy-doctrine-command"));
  const canonReady = Boolean(resolveCanonBinding(STRATEGY_DOCTRINE_HUB_HREF));
  const migrationRouteBound = migrationRoutes.some((r) => r.intelligenceHref === STRATEGY_DOCTRINE_HUB_HREF);

  const artifactScore =
    artifacts.atBar >= MIN_AT_BAR && artifacts.total >= MIN_ARTIFACTS
      ? 100
      : Math.round((artifacts.atBar / MIN_AT_BAR) * 100);
  const registryScore = registry.doctrines.length >= 10 ? 100 : Math.round((registry.doctrines.length / 10) * 100);
  const wireChecks = [fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((artifactScore + registryScore + wireScore) / 3));

  return {
    artifactTotal: artifacts.total,
    artifactsAtBar: artifacts.atBar,
    registryDoctrineCount: registry.doctrines.length,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P3UpgradePassReport = {
  passId: "phase-11-p3-strategy-doctrine";
  title: "Step 11 P3 — Strategy doctrine JSON command";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11P3Progress;
};

export function computePhase11P3UpgradePass(): Phase11P3UpgradePassReport {
  const progress = computePhase11P3Progress();
  return {
    passId: "phase-11-p3-strategy-doctrine",
    title: "Step 11 P3 — Strategy doctrine JSON command",
    summary:
      "Nine SDI-1 JSON artifacts in data/strategy-doctrine/ surfaced in intelligence with P3 depth overlays — debate application, alignment use, review gates, and registry crosswalk on every file.",
    completionPct: progress.overallPct,
    hubHref: STRATEGY_DOCTRINE_HUB_HREF,
    progress,
  };
}

export function assertPhase11P3Bar(): { ok: boolean; message: string } {
  const p = computePhase11P3Progress();
  const issues: string[] = [];
  if (p.artifactsAtBar < MIN_AT_BAR) issues.push(`artifacts ${p.artifactsAtBar}/${MIN_AT_BAR}`);
  if (p.artifactTotal < MIN_ARTIFACTS) issues.push(`total ${p.artifactTotal}/${MIN_ARTIFACTS}`);
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (p.registryDoctrineCount < 10) issues.push(`registry ${p.registryDoctrineCount}/10`);
  if (issues.length === 0) return { ok: true, message: "Phase 11 P3 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export { STRATEGY_DOCTRINE_HUB_HREF, PHASE11_P3_STRATEGY_DOCTRINE_ARTIFACT_TOTAL };
