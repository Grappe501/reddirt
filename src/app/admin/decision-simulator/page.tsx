import type { Metadata } from "next";
import { DecisionSimulatorClient } from "@/components/admin/decision-simulator/DecisionSimulatorClient";

export const metadata: Metadata = {
  title: "Decision Simulator",
  description: "Advisory decision ensemble simulator. Not the campaign website.",
  robots: { index: false, follow: false },
};

export default function DecisionSimulatorPage() {
  return <DecisionSimulatorClient />;
}
