import type { ReactNode } from "react";

export default function DecisionSimulatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dec-sim-lab" data-product="decision-simulator">
      {children}
    </div>
  );
}
