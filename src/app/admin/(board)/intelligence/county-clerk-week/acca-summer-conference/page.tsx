import { V4AccaConferenceDepthHub } from "@/components/admin/intelligence/v4/V4AccaConferencePrepPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { loadAccaClerksConference2026 } from "@/lib/intelligence/v4/accaClerksConference2026Depth";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** ACCA Summer Conference 2026 — Mountain View clerk audience + Thu Jun 11 SOS candidates panel. */
export default function AccaSummerConferencePrepPage() {
  const event = loadAccaClerksConference2026();
  const panel = event.sosCandidatesPanel;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="County clerks week · ACCA Summer Conference 2026"
        title="Mountain View panel prep — Thu June 11, 1–3pm"
        description={`Two-hour moderated Q&A with Hammer and Pakko in front of Arkansas county clerks. ${panel.format}. Not a TV debate — clerk partnership audition.`}
        guide={getSurfaceGuide("countyClerkWeek")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/county-clerk-week"
          className="rounded-full border border-violet-300/60 px-3 py-1 text-xs font-bold text-violet-950"
        >
          7-day clerk path
        </Link>
        <Link
          href="/admin/intelligence/kelly-debate-coaching"
          className="rounded-full border border-sky-300/60 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Kelly debate coaching
        </Link>
        <Link
          href="/admin/intelligence/election-funding"
          className="rounded-full border border-indigo-300/60 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Election funding
        </Link>
      </V4PageHeader>

      <V4AccaConferenceDepthHub />
    </div>
  );
}
