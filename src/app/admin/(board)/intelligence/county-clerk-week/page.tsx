import { V7CountyClerkPrepPath } from "@/components/admin/intelligence/v4/V7CountyClerkPrepPath";
import { V7MichaelPackoScaffoldPanel } from "@/components/admin/intelligence/v4/V7MichaelPackoScaffoldPanel";
import { V4AccaConferenceEventBanner } from "@/components/admin/intelligence/v4/V4AccaConferencePrepPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { V4OpponentContrastPlaybookPanel } from "@/components/admin/intelligence/v4/V4OpponentContrastPlaybookPanel";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";

export default function CountyClerkWeekPage() {
  const clerkPrimary = isCountyClerkPrimaryAudience();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Kelly · county clerks week"
        title="Seven-day prep path"
        description={
          clerkPrimary
            ? "Primary audience mode is ON: county clerks and election commissioners. Follow each day's reading order before events — trap Hammer on implementation, not motive."
            : "Structured week for county clerk tour: daily readings, rehearsal, live card, and Packo watch. Set NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE=county_clerks for clerk-first nav."
        }
      >
        <V4BackLinks />
      </V4PageHeader>

      <V4AccaConferenceEventBanner />

      <V7CountyClerkPrepPath />
      <V4OpponentContrastPlaybookPanel />
      <V7MichaelPackoScaffoldPanel />
    </div>
  );
}
