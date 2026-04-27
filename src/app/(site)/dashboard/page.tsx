import type { Metadata } from "next";
import { PersonalDashboardView } from "@/components/dashboard/personal";

export const metadata: Metadata = {
  title: "My dashboard",
  description: "Personal Power of 5 dashboard — your circle, team progress, conversations, follow-ups, and impact (demo data until live).",
};

/**
 * Personal volunteer dashboard — demo payload only; no session or voter-linked data.
 */
export default function PersonalDashboardPage() {
  return <PersonalDashboardView />;
}
