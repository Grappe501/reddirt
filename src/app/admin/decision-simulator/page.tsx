import { DecisionSimulatorClient } from "@/components/admin/decision-simulator/DecisionSimulatorClient";

export default function DecisionSimulatorPage() {
  return (
    <main className="min-h-screen bg-kelly-canvas px-4 py-6 md:px-6 lg:px-8">
      <DecisionSimulatorClient />
    </main>
  );
}
