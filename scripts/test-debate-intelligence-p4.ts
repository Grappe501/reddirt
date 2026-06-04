/**
 * P4 — Debate war room (film room, cross-exam, argument library) launch-safe.
 */
import {
  buildArgumentLibrary,
  buildCrossExamBank,
  buildLaunchFilmRoomState,
  loadDebateWarRoomP4Packet,
} from "../src/lib/intelligence/v4/debateWarRoomP4";
import { loadDebateIntelligenceV4HubPacket } from "../src/lib/intelligence/v4/debateIntelligenceV4";
import { loadSafeDebateCommandPageData } from "../src/lib/intelligence/safeDebateCommandLoads";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const film = buildLaunchFilmRoomState();
assert(film.items.length >= 1, "film room items from clips JSON");
assert(film.archiveHonestyNote.includes("P4"), "honesty note");

const v4 = loadDebateIntelligenceV4HubPacket();
const cross = buildCrossExamBank(v4);
const args = buildArgumentLibrary(v4);
assert(cross.length >= 8, `cross-exam bank ${cross.length}`);
assert(args.length >= 6, `argument library ${args.length}`);
assert(cross.some((r) => r.billAnchor != null), "bill-anchored cross exam");
assert(args.every((a) => a.debateStep.length > 10), "debate steps on args");

const packet = loadDebateWarRoomP4Packet();
assert(packet.version === "4.0-p4", "packet version");
assert(packet.filmRoom.items.length >= 1, "packet film room");
assert(packet.crossExamBank.length >= 8, "packet cross exam");
assert(packet.readinessScores.length >= 3, "readiness scores");

const prev = process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE;
process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE = "opposition_debate";
const cmd = loadSafeDebateCommandPageData();
assert("p4" in cmd && cmd.p4.filmRoom.items.length >= 1, "launch debate command has P4 film room");
assert(cmd.state.filmRoom.directClipCount >= 0, "state film room");
process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE = prev;

console.log("Debate intelligence P4");
console.log("  film items:", film.items.length);
console.log("  cross-exam:", packet.crossExamBank.length);
console.log("  argument rows:", packet.argumentLibrary.length);
console.log("  readiness lanes:", packet.readinessScores.length);
console.log("OK — P4 war room hardened for launch");
