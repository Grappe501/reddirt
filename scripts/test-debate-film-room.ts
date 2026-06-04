import assert from "node:assert/strict";
import { loadDebateFilmRoomPagePacket } from "../src/lib/intelligence/v4/debateFilmRoomPage";
import { enrichFilmRoomWithMediaCatalog } from "../src/lib/intelligence/v4/debateFilmRoomEnrichment";
import { buildLaunchFilmRoomState } from "../src/lib/intelligence/v4/debateWarRoomP4";

const enriched = enrichFilmRoomWithMediaCatalog(buildLaunchFilmRoomState());
assert(enriched.items.length >= 8, `enriched items ${enriched.items.length}`);
assert(
  enriched.items.some((i) => i.assetType === "MEDIA_TRANSCRIPT_EXCERPT"),
  "transcript excerpts present",
);
assert(enriched.items.some((i) => i.id.startsWith("media-")), "catalog media rows");

const packet = loadDebateFilmRoomPagePacket();
assert(packet.mediaDrills.length >= 3, `media drills ${packet.mediaDrills.length}`);
assert(packet.crossExamBank.length >= 8, "cross exam");
assert(packet.argumentLibrary.length >= 6, "argument library");
assert(
  packet.mediaDrills.some((d) => d.keySegments.length > 0),
  "drill with transcript segments",
);
assert(
  packet.mediaDrills.some((d) => d.trapLaneHref != null),
  "trap lane link on drill",
);

console.log("test-debate-film-room: OK", {
  items: packet.filmRoom.items.length,
  mediaDrills: packet.mediaDrills.length,
  crossExam: packet.crossExamBank.length,
});
