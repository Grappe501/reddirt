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

console.log("test-video-archive-room: OK", {
  focusBillCount: packet.focusBillCount,
  totalCommitteeLinks: packet.totalCommitteeLinks,
});
