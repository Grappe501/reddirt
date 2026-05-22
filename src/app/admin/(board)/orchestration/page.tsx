import { buildOrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";
import { OrchestrationCommandCenter } from "@/components/admin/orchestration/OrchestrationCommandCenter";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ period?: string; role?: string }>;
};

export default async function OrchestrationPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const period = sp.period ?? "2026-04";
  const role = (sp.role ?? "campaign_manager") as CampaignUserRole;

  const payload = await buildOrchestrationStatePayload(period, {
    pathname: "/admin/orchestration",
    role,
  });

  return <OrchestrationCommandCenter payload={payload} />;
}
