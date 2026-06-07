import type { ReactNode } from "react";
import { StrategyDoctrineExperience } from "@/components/admin/intelligence/strategy-doctrine/StrategyDoctrineExperience";

export const dynamic = "force-dynamic";

export default function StrategyDoctrineLayout({ children }: { children: ReactNode }) {
  return <StrategyDoctrineExperience>{children}</StrategyDoctrineExperience>;
}
