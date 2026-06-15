import "./election-plan.css";

/** Standalone executive portal — no site nav, no admin chrome. */
export default function ElectionPlanLayout({ children }: { children: React.ReactNode }) {
  return <div className="ep-portal min-h-screen font-body antialiased">{children}</div>;
}
