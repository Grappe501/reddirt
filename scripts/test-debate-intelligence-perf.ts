/**
 * Smoke test for debate packet caching and load profiles.
 */
import {
  clearDebateIntelligencePacketCache,
  getCachedDebatePacket,
} from "../src/lib/intelligence/debateIntelligencePacketCache";
import {
  loadDebateIntelligenceV4HubPacket,
  loadDebateIntelligenceV4Packet,
  loadDebateIntelligenceV4SurfacePacket,
} from "../src/lib/intelligence/v4/debateIntelligenceV4";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

clearDebateIntelligencePacketCache();

let cacheHits = 0;
getCachedDebatePacket("test-key", () => {
  cacheHits += 1;
  return { ok: true };
});
getCachedDebatePacket("test-key", () => {
  cacheHits += 1;
  return { ok: true };
});
assert(cacheHits === 1, "packet cache should return same instance on second call");

const surface = loadDebateIntelligenceV4SurfacePacket();
assert(surface.themeMatrix.length > 0, "surface packet should load theme matrix");
assert(surface.timeline.length > 0, "surface packet should load timeline");
assert(surface.debatePrepSectionsV4.length === 0, "surface packet skips v4 prep extension");

const hub = loadDebateIntelligenceV4HubPacket();
assert(hub.debatePrepSectionsV4.length >= 14, "hub packet should include prep sections");
assert(hub.likelyArguments.length >= 6, "hub packet should load likely arguments JSON");

const full = loadDebateIntelligenceV4Packet("full");
assert(full.researchLayers.publicDossier.length > 0 || full.billNarratives.length > 0, "full packet loads deep layers");

console.log("test-debate-intelligence-perf: OK");
