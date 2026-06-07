import "server-only";

import { listFilmRoomMediaDrills } from "@/lib/intelligence/v4/debateFilmRoomEnrichment";
import { buildEvidenceHonestySummary } from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";

export function buildEvidenceHonestySummaryForRuntime() {
  const filmDrills = listFilmRoomMediaDrills().map((drill) => ({
    claimsGate: drill.claimsGate,
    speakerVerification: drill.speakerVerification,
  }));
  return buildEvidenceHonestySummary(filmDrills);
}

export function countFilmRoomDrillsForRuntime(): number {
  return listFilmRoomMediaDrills().length;
}
