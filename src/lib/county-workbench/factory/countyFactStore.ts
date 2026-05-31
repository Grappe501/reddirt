import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import type {
  CountyFact,
  CountyFactsFile,
  CountyFactoryAuditEvent,
  CountyIngestionResult,
  CountySourcesFile,
} from "./countyFactoryTypes";
import { COUNTY_FACTORY_PATHS, countyFactoryAbs } from "./countyFactoryPaths";

function factId(countySlug: string, factType: string, factKey: string): string {
  const hash = createHash("sha256").update(`${countySlug}:${factType}:${factKey}`).digest("hex").slice(0, 12);
  return `cf-${hash}`;
}

export function loadCountyFacts(repoRoot: string = process.cwd()): CountyFactsFile {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.facts, repoRoot);
  if (!existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), facts: [] };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as CountyFactsFile;
}

export function saveCountyFacts(file: CountyFactsFile, repoRoot: string = process.cwd()): void {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.facts, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify({ ...file, generatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
}

export function upsertCountyFact(fact: Omit<CountyFact, "id"> & { id?: string }, repoRoot?: string): CountyFact {
  const file = loadCountyFacts(repoRoot);
  const id = fact.id ?? factId(fact.countySlug, fact.factType, fact.factKey);
  const row: CountyFact = { ...fact, id };
  const idx = file.facts.findIndex((f) => f.id === id);
  if (idx >= 0) file.facts[idx] = row;
  else file.facts.push(row);
  saveCountyFacts(file, repoRoot);
  return row;
}

export function batchUpsertCountyFacts(facts: Array<Omit<CountyFact, "id"> & { id?: string }>, repoRoot?: string): number {
  const file = loadCountyFacts(repoRoot);
  const byId = new Map(file.facts.map((f) => [f.id, f]));
  for (const fact of facts) {
    const id = fact.id ?? factId(fact.countySlug, fact.factType, fact.factKey);
    byId.set(id, { ...fact, id });
  }
  file.facts = [...byId.values()];
  saveCountyFacts(file, repoRoot);
  return facts.length;
}

export function findFactsByCounty(countySlug: string, repoRoot?: string): CountyFact[] {
  return loadCountyFacts(repoRoot).facts.filter((f) => f.countySlug === countySlug);
}

export function findFactsByType(factType: string, repoRoot?: string): CountyFact[] {
  return loadCountyFacts(repoRoot).facts.filter((f) => f.factType === factType);
}

export function findFactsBySource(sourceId: string, repoRoot?: string): CountyFact[] {
  return loadCountyFacts(repoRoot).facts.filter((f) => f.sourceId === sourceId);
}

export function findMissingFactsByCounty(countySlug: string, requiredTypes: string[], repoRoot?: string): string[] {
  const present = new Set(findFactsByCounty(countySlug, repoRoot).map((f) => f.factType));
  return requiredTypes.filter((t) => !present.has(t));
}

export function summarizeCountyFactCoverage(repoRoot?: string) {
  const facts = loadCountyFacts(repoRoot).facts;
  const byCounty: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const f of facts) {
    byCounty[f.countySlug] = (byCounty[f.countySlug] ?? 0) + 1;
    byStatus[f.verificationStatus] = (byStatus[f.verificationStatus] ?? 0) + 1;
    bySource[f.sourceId] = (bySource[f.sourceId] ?? 0) + 1;
    byType[f.factType] = (byType[f.factType] ?? 0) + 1;
  }
  const countiesWithFacts = Object.keys(byCounty).length;
  return {
    totalFacts: facts.length,
    countiesRepresented: countiesWithFacts,
    all75Represented: countiesWithFacts >= ARKANSAS_COUNTY_REGISTRY.length,
    byCounty,
    byStatus,
    bySource,
    byType,
    avgFactsPerCounty: facts.length / Math.max(countiesWithFacts, 1),
  };
}

export function loadCountySourcesRegistry(repoRoot: string = process.cwd()): CountySourcesFile {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.sources, repoRoot);
  if (!existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), sources: [] };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as CountySourcesFile;
}

export function saveCountySourcesRegistry(file: CountySourcesFile, repoRoot: string = process.cwd()): void {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.sources, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify({ ...file, generatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
}

export function appendCountyFactoryAuditEvent(
  event: Omit<CountyFactoryAuditEvent, "eventId" | "createdAt">,
  repoRoot?: string,
): void {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.auditLog, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  const existing: CountyFactoryAuditEvent[] = existsSync(abs)
    ? (JSON.parse(readFileSync(abs, "utf8")) as { events: CountyFactoryAuditEvent[] }).events
    : [];
  existing.push({
    ...event,
    eventId: `cfa-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  });
  writeFileSync(abs, `${JSON.stringify({ version: 1, events: existing.slice(-500) }, null, 2)}\n`, "utf8");
}

export function saveIngestionRun(result: CountyIngestionResult, repoRoot?: string): void {
  const abs = countyFactoryAbs(COUNTY_FACTORY_PATHS.ingestionRuns, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  const existing: CountyIngestionResult[] = existsSync(abs)
    ? (JSON.parse(readFileSync(abs, "utf8")) as { runs: CountyIngestionResult[] }).runs
    : [];
  existing.push(result);
  writeFileSync(abs, `${JSON.stringify({ version: 1, runs: existing.slice(-200) }, null, 2)}\n`, "utf8");
}

/** Seed registry identity facts for all 75 counties — no invented field data. */
export function seedRegistryIdentityFacts(repoRoot?: string): number {
  const now = new Date().toISOString();
  const facts: Array<Omit<CountyFact, "id">> = [];
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    facts.push(
      {
        countySlug: c.slug,
        factType: "identity",
        factKey: "displayName",
        value: c.displayName,
        valueType: "string",
        sourceId: "arkansas-county-registry",
        sourceName: "Arkansas County Registry",
        sourceUrlOrPath: "src/lib/county/arkansas-county-registry.ts",
        sourceDate: null,
        retrievedAt: now,
        confidence: 100,
        verificationStatus: "VERIFIED",
        publicUseRisk: "LOW",
        reviewStatus: "HUMAN_VERIFIED",
        notes: "Canonical registry identity",
      },
      {
        countySlug: c.slug,
        factType: "identity",
        factKey: "fips",
        value: c.fips,
        valueType: "string",
        sourceId: "arkansas-county-registry",
        sourceName: "Arkansas County Registry",
        sourceUrlOrPath: "src/lib/county/arkansas-county-registry.ts",
        sourceDate: null,
        retrievedAt: now,
        confidence: 100,
        verificationStatus: "VERIFIED",
        publicUseRisk: "LOW",
        reviewStatus: "HUMAN_VERIFIED",
        notes: "FIPS code",
      },
      {
        countySlug: c.slug,
        factType: "identity",
        factKey: "regionId",
        value: c.regionId,
        valueType: "string",
        sourceId: "arkansas-county-registry",
        sourceName: "Arkansas County Registry",
        sourceUrlOrPath: "src/lib/county/arkansas-county-registry.ts",
        sourceDate: null,
        retrievedAt: now,
        confidence: 100,
        verificationStatus: "VERIFIED",
        publicUseRisk: "LOW",
        reviewStatus: "HUMAN_VERIFIED",
        notes: "Campaign region grouping",
      },
    );
  }
  return batchUpsertCountyFacts(facts, repoRoot);
}
