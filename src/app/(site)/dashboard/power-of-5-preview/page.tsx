import type { Metadata } from "next";

import { PersonalDashboardView } from "@/components/dashboard/personal";

export const metadata: Metadata = {
  title: "Volunteer preview (Power of 5)",
  description:
    "Legacy public preview of Power of 5 circle, team rhythm, and demo tiles — illustrative data only. The main VOS home is /dashboard.",
};

/** Previous /dashboard experience preserved for comparison and screenshots. */
export default function PowerOfFivePreviewDashboardPage() {
  return <PersonalDashboardView />;
}
