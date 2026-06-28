/**
 * Validate CPOS meeting manifests (no DB).
 * Usage: npm run cpos:validate-manifest -- kickoff-2026
 */
import { loadMeetingManifest } from "../src/lib/cpos/load-meeting-manifest";

const meetingId = process.argv[2] ?? "kickoff-2026";
const result = loadMeetingManifest(meetingId);

console.log(`Manifest: ${result.manifest.id} v${result.manifest.version}`);
console.log(`Source: ${result.source}`);
console.log(`Chapters: ${result.manifest.chapters.length}`);
if (result.warnings.length > 0) {
  console.warn("Warnings:");
  result.warnings.forEach((w) => console.warn(`  - ${w}`));
}
if (result.source === "fallback") {
  console.error("FAILED — using fallback manifest");
  process.exit(1);
}
console.log("OK");
