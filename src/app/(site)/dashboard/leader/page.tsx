import type { Metadata } from "next";
import { PowerOf5LeaderDashboardView } from "@/components/dashboard/leader";
import { buildPowerOf5LeaderDashboardDemo } from "@/lib/campaign-engine/power-of-5/build-leader-dashboard-demo";

export const metadata: Metadata = {
  title: "Leadership preview",
  description:
    "Public preview for Power Team mentors — teams, gaps, coaching signals, and follow-ups — illustrative demo data only.",
};

/**
 * Public route with demo / seed data only — no auth, voter file, or live Power of 5 metrics. Route `/dashboard/leader` unchanged.
 */
export default function LeaderDashboardPage() {
  const data = buildPowerOf5LeaderDashboardDemo();
  return <PowerOf5LeaderDashboardView data={data} />;
}
