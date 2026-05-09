import type { ReactNode } from "react";
import { CampaignStrategyExperience } from "@/components/admin/campaign-strategy/CampaignStrategyExperience";
import { StrategyPartnerPanel } from "@/components/admin/campaign-strategy/StrategyPartnerPanel";
import { StrategyShareProtocolBanner } from "@/components/admin/campaign-strategy/StrategyShareProtocolBanner";

export default function CampaignStrategyLayout({ children }: { children: ReactNode }) {
  return (
    <CampaignStrategyExperience>
      <StrategyShareProtocolBanner />
      <StrategyPartnerPanel />
      {children}
    </CampaignStrategyExperience>
  );
}
