import assert from "node:assert/strict";
import { buildVideoArchiveRoomPacket, VIDEO_ARCHIVE_FOCUS_ANCHORS } from "../src/lib/legislature/videoArchiveRoom";
import { loadVideoArchiveRoomManifest } from "../src/lib/legislature/videoArchiveRoomManifest";

const packet = buildVideoArchiveRoomPacket();
assert.ok(packet.focusBillCount > 0);
assert.ok(packet.bills.some((b) => b.isDebateAnchor));
const anchorsInPacket = VIDEO_ARCHIVE_FOCUS_ANCHORS.filter((anchor) =>
  packet.bills.some((b) => b.billNumber === anchor),
);
assert.ok(anchorsInPacket.length >= 3, `expected most debate anchors in packet, got ${anchorsInPacket.join(",")}`);

const withVideo = packet.bills.filter((b) => b.committeeVideos.length > 0);
assert.ok(withVideo.length >= 1, "expected at least one bill with discovered video");

const sb486 = packet.bills.find((b) => b.billNumber === "SB486");
assert.ok(sb486 && sb486.committeeVideos.length >= 1);

const manifest = loadVideoArchiveRoomManifest();
assert.equal(manifest.cutReadyFolderLabel, "cut-and-ready");
assert.ok(packet.opponentMedia.hammer.length >= 5);
assert.ok(packet.opponentMedia.packo.length >= 5);

assert.ok(packet.legislativeRecord.bills.length >= 5, "direct democracy offense bills");
assert.ok(packet.roadStories.storySlots.length >= 3, "road story slots");
assert.ok(packet.transcripts.catalogCount >= 2, "opponent media transcripts");

const hammerWithTranscript = packet.opponentMedia.hammer.filter((r) => r.transcript?.segments?.length);
assert.ok(hammerWithTranscript.length >= 2, "hammer media with transcript excerpts");

console.log("test-video-archive-room: OK", {
  focusBillCount: packet.focusBillCount,
  totalCommitteeLinks: packet.totalCommitteeLinks,
  hammerMedia: packet.opponentMedia.hammer.length,
  packoMedia: packet.opponentMedia.packo.length,
  offenseBills: packet.legislativeRecord.bills.length,
  transcripts: packet.transcripts.catalogCount,
  hammerTranscribed: hammerWithTranscript.length,
});
