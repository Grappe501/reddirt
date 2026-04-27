import { buildNarrativeAdminCommandCenterModel } from "@/lib/narrative-distribution/demo-admin-command-center";
import { NarrativeAdminKpiStrip } from "./NarrativeAdminKpiStrip";
import { NarrativeAdminSection } from "./NarrativeAdminSection";
import { NarrativeAmplificationQueue } from "./NarrativeAmplificationQueue";
import { NarrativeChannelReadinessGrid } from "./NarrativeChannelReadinessGrid";
import { NarrativeCountyPacketList } from "./NarrativeCountyPacketList";
import { NarrativeEditorialStatusBoard } from "./NarrativeEditorialStatusBoard";
import { NarrativeFeedbackNeedsPanel } from "./NarrativeFeedbackNeedsPanel";
import { NarrativeRegionPacketList } from "./NarrativeRegionPacketList";
import { PowerOf5LaunchIntegrationPanel } from "./PowerOf5LaunchIntegrationPanel";
import { NarrativeStoryPipeline } from "./NarrativeStoryPipeline";

export function NarrativeDistributionCommandCenter() {
  const model = buildNarrativeAdminCommandCenterModel();

  return (
    <div className="space-y-12">
      <header className="rounded-card border border-amber-200/80 bg-amber-50/60 p-4 text-sm text-amber-950">
        <p className="font-heading font-bold text-amber-950">Prototype — demo data only</p>
        <p className="mt-1 text-amber-950/85">
          Read-only narrative distribution command layout. No publishing actions, no outbound sends, no voter-linked fields. Execution stays on existing
          comms and CMS rails when wired.
        </p>
      </header>

      <PowerOf5LaunchIntegrationPanel />

      <NarrativeAdminSection
        overline="Overview"
        title="KPI strip"
        description="Counts are illustrative and derived from the static demo registry — not production telemetry."
      >
        <NarrativeAdminKpiStrip items={model.kpis} />
      </NarrativeAdminSection>

      <NarrativeAdminSection
        overline="Leaders"
        title="Amplification queue"
        description="Ordered asks tied to packets and message templates (ids only). Sort order is demo-only."
      >
        <NarrativeAmplificationQueue items={model.amplificationQueue} />
      </NarrativeAdminSection>

      <NarrativeAdminSection
        overline="Field → editorial"
        title="Story pipeline"
        description="Theme summaries from field intake — no raw transcripts in this prototype."
      >
        <NarrativeStoryPipeline items={model.storyPipeline} />
      </NarrativeAdminSection>

      <div className="grid gap-12 lg:grid-cols-1">
        <NarrativeAdminSection
          overline="Geography"
          title="County packet list"
          description="County narrative plans with gap chips. Links open public OIS county stubs."
        >
          <NarrativeCountyPacketList items={model.countyPackets} />
        </NarrativeAdminSection>

        <NarrativeAdminSection
          overline="Geography"
          title="Region packet list"
          description="Eight campaign regions with demo packet assignments."
        >
          <NarrativeRegionPacketList items={model.regionPackets} />
        </NarrativeAdminSection>
      </div>

      <NarrativeAdminSection
        overline="Channels"
        title="Channel readiness"
        description="Per-surface checklist posture for the demo wave — not a live integration status board."
      >
        <NarrativeChannelReadinessGrid items={model.channelReadiness} />
      </NarrativeAdminSection>

      <NarrativeAdminSection
        overline="Editorial"
        title="Status board"
        description="Packets grouped by a demo-only editorial view (mixed statuses for layout exercise)."
      >
        <NarrativeEditorialStatusBoard packets={model.packetsWithEditorialView} />
      </NarrativeAdminSection>

      <NarrativeAdminSection
        overline="Coordination"
        title="Feedback needs"
        description="Open questions and staff handoffs — no automation claims; assignments are labels only."
      >
        <NarrativeFeedbackNeedsPanel items={model.feedbackNeeds} />
      </NarrativeAdminSection>
    </div>
  );
}
