import fs from "node:fs";
import path from "node:path";
import { buildArklegBillUrl } from "./legislativeFetch";

export type PriorityBillRetrievalStatus =
  | "NOT_STARTED"
  | "SOURCE_PACKET_READY"
  | "VIDEO_DISCOVERED"
  | "QUEUED_FOR_TRANSCRIPTION"
  | "TRANSCRIPT_READY"
  | "CHUNKED"
  | "CLAIMS_INGESTED"
  | "BLOCKED";

export type PriorityBillEntry = {
  billNumber: string;
  session: string;
  chamber: "Senate" | "House" | "Unknown";
  title: string;
  sponsor: string;
  cosponsors: string[];
  status: string;
  topics: string[];
  committeeRefs: string[];
  knownDates: string[];
  billUrl: string;
  priorityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reasonTracked: string;
  oppositionRelevance: string;
  debateRelevance: string;
  messageRelevance: string;
  retrievalStatus: PriorityBillRetrievalStatus;
  videoDiscoveryStatus: "NONE" | "CANDIDATES_FOUND" | "PROCESSING" | "COMPLETE" | "BLOCKED";
};

export type PriorityBillRegistryFile = {
  version: number;
  generatedAt: string;
  opponentId: string;
  bills: PriorityBillEntry[];
};

export const PRIORITY_BILL_REGISTRY_REL = "data/opposition/kim-hammer-profile/priority-bill-registry.json";
const ELECTION_INDEX_REL = "data/opposition/kim-hammer-election-record-bill-index.json";

function chamberFromBill(billNumber: string): PriorityBillEntry["chamber"] {
  if (billNumber.startsWith("SB") || billNumber.startsWith("SR") || billNumber.startsWith("SMR")) return "Senate";
  if (billNumber.startsWith("HB") || billNumber.startsWith("HR")) return "House";
  return "Unknown";
}

function priorityFromTopics(topics: string[], hammerRole: string): PriorityBillEntry["priorityLevel"] {
  const electionTopics = ["ballot_access", "county_election_administration", "election_integrity", "direct_democracy"];
  if (topics.some((t) => electionTopics.includes(t))) return hammerRole === "sponsor" ? "CRITICAL" : "HIGH";
  if (hammerRole === "sponsor") return "HIGH";
  return "MEDIUM";
}

export function bootstrapPriorityBillRegistryFromElectionIndex(
  repoRoot: string = process.cwd(),
): PriorityBillRegistryFile {
  const index = JSON.parse(
    fs.readFileSync(path.join(repoRoot, ELECTION_INDEX_REL), "utf8"),
  ) as {
    rows: Array<{
      billNumber: string;
      sessionYear: string;
      title: string;
      hammerRole: string;
      topicCategory: string[];
      status: string;
      sourceLinks: string[];
    }>;
  };

  const bills: PriorityBillEntry[] = index.rows.map((row) => {
    const priority = priorityFromTopics(row.topicCategory, row.hammerRole);
    return {
      billNumber: row.billNumber,
      session: row.sessionYear,
      chamber: chamberFromBill(row.billNumber),
      title: row.title,
      sponsor: row.hammerRole === "sponsor" ? "Kim Hammer" : "Various",
      cosponsors: [],
      status: row.status,
      topics: row.topicCategory,
      committeeRefs: [],
      knownDates: [],
      billUrl: row.sourceLinks.find((l) => l.startsWith("http")) ?? buildArklegBillUrl(row.billNumber, row.sessionYear),
      priorityLevel: priority,
      reasonTracked: `KH election record index — ${row.hammerRole}`,
      oppositionRelevance: row.topicCategory.includes("ballot_access") ? "HIGH" : "MEDIUM",
      debateRelevance: priority === "CRITICAL" ? "HIGH" : "MEDIUM",
      messageRelevance: row.topicCategory.includes("county_election_administration") ? "HIGH" : "MEDIUM",
      retrievalStatus: "NOT_STARTED",
      videoDiscoveryStatus: "NONE",
    };
  });

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    opponentId: "kim-hammer",
    bills,
  };
}

export function loadPriorityBillRegistry(repoRoot: string = process.cwd()): PriorityBillRegistryFile {
  const abs = path.join(repoRoot, PRIORITY_BILL_REGISTRY_REL);
  if (!existsSyncSafe(abs)) {
    const boot = bootstrapPriorityBillRegistryFromElectionIndex(repoRoot);
    savePriorityBillRegistry(boot, repoRoot);
    return boot;
  }
  return JSON.parse(fs.readFileSync(abs, "utf8")) as PriorityBillRegistryFile;
}

function existsSyncSafe(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

export function savePriorityBillRegistry(file: PriorityBillRegistryFile, repoRoot: string = process.cwd()): void {
  file.generatedAt = new Date().toISOString();
  const abs = path.join(repoRoot, PRIORITY_BILL_REGISTRY_REL);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

export function summarizePriorityBills(registry: PriorityBillRegistryFile) {
  const byPriority = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const b of registry.bills) byPriority[b.priorityLevel] += 1;
  return {
    total: registry.bills.length,
    byPriority,
    withVideo: registry.bills.filter((b) => b.videoDiscoveryStatus !== "NONE").length,
    chunked: registry.bills.filter((b) => b.retrievalStatus === "CHUNKED" || b.retrievalStatus === "CLAIMS_INGESTED").length,
  };
}

export function findPriorityBillsBySponsor(registry: PriorityBillRegistryFile, sponsor: string): PriorityBillEntry[] {
  return registry.bills.filter((b) => b.sponsor.toLowerCase().includes(sponsor.toLowerCase()));
}

export function findPriorityBillsByTopic(registry: PriorityBillRegistryFile, topic: string): PriorityBillEntry[] {
  return registry.bills.filter((b) => b.topics.some((t) => t.includes(topic)));
}

export function markBillVideoDiscoveryStatus(
  billNumber: string,
  session: string,
  status: PriorityBillEntry["videoDiscoveryStatus"],
  retrievalStatus?: PriorityBillRetrievalStatus,
  repoRoot: string = process.cwd(),
): void {
  const registry = loadPriorityBillRegistry(repoRoot);
  const bill = registry.bills.find((b) => b.billNumber === billNumber && b.session === session);
  if (!bill) return;
  bill.videoDiscoveryStatus = status;
  if (retrievalStatus) bill.retrievalStatus = retrievalStatus;
  savePriorityBillRegistry(registry, repoRoot);
}
