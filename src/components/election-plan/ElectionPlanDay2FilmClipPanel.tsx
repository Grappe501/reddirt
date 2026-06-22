import { AccaForumClipBriefsPanel } from "@/components/election-plan/AccaForumClipBriefsPanel";
import { DAY2_FILM_ROOM_CLIP_IDS } from "@/lib/election-plan/acca-forum-study-clips";
import { buildAccaClipBriefs } from "@/lib/election-plan/load-acca-forum-clip-briefs";

export function ElectionPlanDay2FilmClipPanel() {
  const briefs = buildAccaClipBriefs(DAY2_FILM_ROOM_CLIP_IDS);

  return (
    <AccaForumClipBriefsPanel
      briefs={briefs}
      storageKey="kelly-day2-forum-briefs-reviewed-v2"
      title="Opponent tell briefs · ACCA forum transcript"
      lead="Five forum moments for Hammer and Pakko — read the pull quotes and transcript excerpts, then rehearse one pivot line each. Staff already ingested the full ACCA transcript."
      minimumHint="minimum tonight: Hammer opening + ranking + Pakko segment"
      completeHint="Brief gate met — complete the tell worksheet and speak one ranking pivot aloud."
    />
  );
}
