"use client";

import { useRouter } from "next/navigation";

import { ElectionPlanFieldEntryPanel } from "@/components/election-plan/ElectionPlanFieldEntryPanel";
import type { FieldEntryLocationSummary } from "@/lib/election-plan/field-entry/types";

type Props = {
  countySlug: string;
  countyName: string;
  citySlug?: string | null;
  cityName?: string | null;
  initial: FieldEntryLocationSummary;
  operatorInitials: string | null;
};

export function LeaderFieldLogPanel(props: Props) {
  const router = useRouter();
  return <ElectionPlanFieldEntryPanel {...props} onLogged={() => router.refresh()} />;
}
