import type { ReactNode } from "react";
import { buildKellyStrategicPlanNav } from "@/lib/campaign-strategy/kelly-strategic-plan-nav";
import { KellyStrategicPlanExperience } from "@/components/admin/intelligence/kelly-strategic-plan/KellyStrategicPlanExperience";

export const dynamic = "force-dynamic";

export default function KellyStrategicPlanLayout({ children }: { children: ReactNode }) {
  const nav = buildKellyStrategicPlanNav();
  return <KellyStrategicPlanExperience nav={nav}>{children}</KellyStrategicPlanExperience>;
}
