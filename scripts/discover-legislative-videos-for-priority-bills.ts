#!/usr/bin/env tsx
/** Discover video candidates for priority bills (respects fetch budget). */
import { getLegislativeFetchPolicy, resetLegislativeFetchBudget } from "../src/lib/legislature/legislativeFetch";
import { buildLegislativeSourcePacket } from "../src/lib/legislature/arkansasLegislativeSourceDiscovery";
import { loadPriorityBillRegistry } from "../src/lib/legislature/priorityBillRegistry";
import { upsertVideoCandidate, type LegislativeVideoCandidate } from "../src/lib/legislature/legislativeVideoArchiveStore";
import { DEFAULT_SPONSOR_NAME } from "../src/lib/legislature/legislativeGovernance";

async function main() {
  resetLegislativeFetchBudget();
  const policy = getLegislativeFetchPolicy();
  const registry = loadPriorityBillRegistry();
  let added = 0;

  for (const bill of registry.bills.filter((b) => b.priorityLevel === "CRITICAL" || b.priorityLevel === "HIGH").slice(0, policy.maxFetchesPerRun)) {
    const packet = await buildLegislativeSourcePacket(bill.billNumber, bill.session, process.cwd(), policy);
    for (const vc of packet.videoCandidates) {
      const id = `lvc-${bill.billNumber}-${Date.now().toString(36)}`;
      upsertVideoCandidate({
        id,
        billNumber: bill.billNumber,
        session: bill.session,
        committeeName: vc.committeeName,
        meetingDate: vc.meetingDate,
        videoUrl: vc.videoUrl,
        sourcePageUrl: vc.sourcePageUrl,
        sourceType: vc.sourceType,
        duration: null,
        agendaPosition: null,
        sponsorExpected: true,
        expectedSpeaker: DEFAULT_SPONSOR_NAME,
        discoveryConfidence: vc.discoveryConfidence,
        processingStatus: "DISCOVERED",
        retrievalWarnings: packet.retrievalWarnings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      added += 1;
    }
  }
  console.log(JSON.stringify({ videoCandidatesAdded: added, liveDiscovery: policy.liveDiscoveryEnabled }, null, 2));
}

main();
