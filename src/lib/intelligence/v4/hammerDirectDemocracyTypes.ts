/** Client-safe direct-democracy packet types — no node:fs. */

export type DirectDemocracyBillAnchor = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  hammerRole: string;
  arklegUrl: string;
  actPdfUrl?: string;
  plainEnglish: string;
  kellyOffensiveFrame: string;
  trapQuestion: string;
  claimsNote: string;
};

export type HammerDirectDemocracyPacket = {
  generatedAt: string;
  clusterLabel: string;
  thesis: string;
  hammerCornerPaint: string;
  kellySuperiorityLine: string;
  bills: DirectDemocracyBillAnchor[];
  debateSequence: string[];
  packoAllianceNote: string;
};
