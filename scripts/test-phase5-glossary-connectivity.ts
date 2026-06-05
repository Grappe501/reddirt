/**
 * Phase 5 — Debate glossary + hub connectivity + Field Book B/C depth checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DEBATE_GLOSSARY_TERMS } from "../src/lib/intelligence/v4/debateGlossaryRegistry";
import {
  assertPhase5GlossaryConnectivityBar,
  computePhase5GlossaryConnectivityProgress,
  PHASE5_HUB_ROUTES,
} from "../src/lib/intelligence/v4/phase5GlossaryConnectivity";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { FIELD_BOOK_ARTICLES, getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { listStrategyMigrationRoutes, validateStrategyMigrationBridge } from "../src/lib/intelligence/v4/strategyMigrationBridge";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");

function assertRouteExists(routePath: string) {
  const rel = routePath.replace(/^\/admin\/intelligence\/?/, "");
  const segments = rel.split("/").filter(Boolean);
  let dir = APP_ROOT;
  for (const seg of segments) {
    const dynamic = fs.readdirSync(dir, { withFileTypes: true }).find((d) => d.isDirectory() && d.name.startsWith("["));
    if (dynamic) {
      dir = path.join(dir, dynamic.name);
      continue;
    }
    dir = path.join(dir, seg);
  }
  assert.ok(fs.existsSync(path.join(dir, "page.tsx")), `Missing page: ${routePath}`);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const progress = computePhase5GlossaryConnectivityProgress();
assert.ok(progress.glossaryTermsAtBar >= 35, `Glossary terms ${progress.glossaryTermsAtBar} (need 35+)`);
assert.ok(progress.phaseBcArticlesAtBar >= progress.phaseBcArticleTotal, "Phase B/C articles at bar");
assert.ok(progress.hubRoutesBound >= progress.hubRoutesTotal, `Hub bindings ${progress.hubRoutesBound}/${progress.hubRoutesTotal}`);
assert.ok(progress.strategyRouteCount >= 26, `Strategy routes ${progress.strategyRouteCount} (need 26+)`);

const bar = assertPhase5GlossaryConnectivityBar();
assert.ok(bar.ok, bar.message);

const validation = validateStrategyMigrationBridge();
assert.ok(validation.ok, validation.errors.join("; "));

assert.ok(getFieldBookArticle("debate-glossary"), "debate-glossary Field Book article");

for (const href of PHASE5_HUB_ROUTES) {
  assert.ok(resolveCanonBinding(href), `Hub unbound: ${href}`);
}

const phaseBc = FIELD_BOOK_ARTICLES.filter((a) => a.phaseId === "phase-b" || a.phaseId === "phase-c");
for (const article of phaseBc) {
  const rich = article.body.filter((p) => wordCount(p) >= 18);
  assert.ok(rich.length >= 6, `${article.slug}: ${rich.length} rich paragraphs (need 6+)`);
}

assertRouteExists("/admin/intelligence/phase-5-upgrade");
assertRouteExists("/admin/intelligence/field-book/glossary");

const glossaryPanel = fs.readFileSync(
  path.join(process.cwd(), "src/components/admin/intelligence/DebateGlossaryIndex.tsx"),
  "utf8",
);
assert.ok(glossaryPanel.includes("DEBATE_GLOSSARY_TERMS"), "Glossary index component");

assert.ok(DEBATE_GLOSSARY_TERMS.length >= 35, `Registry has ${DEBATE_GLOSSARY_TERMS.length} terms`);

console.log("test-phase5-glossary-connectivity: OK");
console.log(
  `  glossary: ${progress.glossaryTermsAtBar}/${progress.glossaryTermCount} · B/C: ${progress.phaseBcArticlesAtBar}/${progress.phaseBcArticleTotal} · hubs: ${progress.hubRoutesBound}/${progress.hubRoutesTotal} · strategy: ${progress.strategyRouteCount} · overall: ${progress.overallPct}%`,
);
