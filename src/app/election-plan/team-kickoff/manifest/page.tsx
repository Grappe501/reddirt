import { KICKOFF_MEETING_ID, loadMeetingManifest } from "@/lib/cpos/load-meeting-manifest";

export const dynamic = "force-dynamic";

export default function TeamKickoffManifestPreviewPage() {
  const { manifest, source, warnings } = loadMeetingManifest(KICKOFF_MEETING_ID);

  return (
    <div className="cpos-presenter-shell p-6">
      <div className="ep-classification">Dev manifest preview · source: {source}</div>
      <pre className="mt-4 overflow-auto rounded-lg bg-white p-4 text-xs border border-[var(--ep-border)] max-h-[80vh]">
        {JSON.stringify(manifest, null, 2)}
      </pre>
      {warnings.length > 0 && (
        <pre className="mt-4 text-sm text-[var(--ep-accent)]">{warnings.join("\n")}</pre>
      )}
    </div>
  );
}
