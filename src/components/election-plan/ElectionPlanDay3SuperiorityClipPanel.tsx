import { AccaForumClipBriefsPanel } from "@/components/election-plan/AccaForumClipBriefsPanel";
import {
  DAY3_SUPERIORITY_CLIP_IDS,
} from "@/lib/election-plan/acca-forum-study-clips";
import { buildAccaClipBriefs } from "@/lib/election-plan/load-acca-forum-clip-briefs";

type PanelVariant = "manual" | "opposition" | "full";

const VARIANT_CLIP_IDS: Record<PanelVariant, readonly string[]> = {
  manual: ["kelly-opening-people", "kelly-clerk-partnership", "kelly-administrator-800"],
  opposition: ["hammer-opening-16yr", "hammer-bill-sponsor-list", "hammer-closing-ranking"],
  full: DAY3_SUPERIORITY_CLIP_IDS,
};

const VARIANT_COPY: Record<
  PanelVariant,
  { title: string; lead: string; storageKey: string; minimumHint: string; completeHint: string }
> = {
  manual: {
    title: "Superiority briefs · Kelly administrator beats",
    lead: "Read Kelly's ACCA opening and administrator lines from the forum transcript — steal tone and three-job beats for notecards. No bill numbers.",
    storageKey: "kelly-day3-superiority-kelly-briefs-v2",
    minimumHint: "stack three Kelly jobs before offense block",
    completeHint: "Kelly briefs complete — recite three green superiority beats from notecards.",
  },
  opposition: {
    title: "Contrast briefs · Hammer author vs administrator",
    lead: "Read Hammer's experience and bill-list frames from transcript — contrast on job fit, not smear. Claims gate before stage.",
    storageKey: "kelly-day3-superiority-hammer-briefs-v2",
    minimumHint: "one author-vs-administrator pivot cold",
    completeHint: "Hammer contrast briefs complete — link to Hammer admin example after claims gate.",
  },
  full: {
    title: "Superiority map · full transcript brief stack",
    lead: "Kelly beats + Hammer contrast excerpts from the ACCA forum transcript for Day 3 superiority stack rehearsal.",
    storageKey: "kelly-day3-superiority-all-briefs-v2",
    minimumHint: "Kelly opening + Hammer bill-list excerpts",
    completeHint: "Full brief stack reviewed — recite three superiority points.",
  },
};

export function ElectionPlanDay3SuperiorityClipPanel({ variant = "full" }: { variant?: PanelVariant }) {
  const clipIds = VARIANT_CLIP_IDS[variant];
  const copy = VARIANT_COPY[variant];
  const briefs = buildAccaClipBriefs(clipIds);

  return (
    <AccaForumClipBriefsPanel
      briefs={briefs}
      storageKey={copy.storageKey}
      title={copy.title}
      lead={copy.lead}
      minimumHint={copy.minimumHint}
      completeHint={copy.completeHint}
    />
  );
}
