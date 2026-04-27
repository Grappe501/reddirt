import type { Metadata } from "next";
import { PowerOf5LeaderDashboardView } from "@/components/dashboard/leader";
import { buildPowerOf5LeaderDashboardDemo } from "@/lib/campaign-engine/power-of-5/build-leader-dashboard-demo";

export const metadata: Metadata = {
  title: "Leader dashboard",
  description: "Power Team leader rollup — teams, gaps, weak nodes, and follow-ups (demo data on public route).",
};

/**
 * Public route with demo / seed data only — no auth, voter file, or live Power of 5 metrics.
 */
export default function LeaderDashboardPage() {
  const data = buildPowerOf5LeaderDashboardDemo();
  return <PowerOf5LeaderDashboardView data={data} />;
}
