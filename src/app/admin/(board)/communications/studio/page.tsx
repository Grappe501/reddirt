import { loadCommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";
import { routeCampaignWriting } from "@/lib/communications/writing-orchestration/campaign-writing-router";
import { MessageStudioClient } from "@/components/admin/communications/MessageStudioClient";

export const dynamic = "force-dynamic";

const AUDIENCES = ["volunteer", "host", "county_leader", "donor", "campaign_team", "candidate", "general"] as const;
const PURPOSES = [
  "welcome",
  "event_followup",
  "event_promotion",
  "power_of_five",
  "volunteer_recruitment",
  "host_prep",
  "team_briefing",
  "training_nudge",
  "county_activation",
] as const;
const TONES = ["warm", "direct", "urgent", "celebratory", "calm"] as const;

export default function MessageStudioPage() {
  const bundle = loadCommunicationsBundle();
  const initialDraft = routeCampaignWriting({
    audience: "volunteer",
    purpose: "welcome",
    urgency: "low",
  });

  return (
    <MessageStudioClient
      initialDraft={initialDraft}
      audiences={[...AUDIENCES]}
      purposes={[...PURPOSES]}
      tones={[...TONES]}
      massBlocked={bundle.massEmailStatus === "blocked"}
    />
  );
}
