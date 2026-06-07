import type { ReactNode } from "react";
import { buildCampaignSystemNav } from "@/lib/campaign-strategy/campaign-system-nav";
import { CampaignSystemManualExperience } from "@/components/admin/intelligence/campaign-system/CampaignSystemManualExperience";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CampaignSystemManualLayout({ children }: { children: ReactNode }) {
  const nav = await buildCampaignSystemNav();
  return <CampaignSystemManualExperience nav={nav}>{children}</CampaignSystemManualExperience>;
}
