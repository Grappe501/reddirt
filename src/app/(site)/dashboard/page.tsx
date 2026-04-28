import type { Metadata } from "next";
import { PersonalDashboardView } from "@/components/dashboard/personal";

export const metadata: Metadata = {
  title: "Volunteer preview",
  description:
    "Public preview of your Power of 5 circle, team rhythm, conversations, follow-ups, and momentum — illustrative / demo data only.",
};

/**
 * Personal volunteer preview — demo payload only; no session or voter-linked data. Route `/dashboard` unchanged.
 */
export default function PersonalDashboardPage() {
  return <PersonalDashboardView />;
}
