import { ElectionPlanOppositionResearchHubPanel } from "@/components/election-plan/ElectionPlanOppositionResearchHubPanel";

export const metadata = {
  title: "Opposition Research | Election Plan",
  description: "Kim Hammer intelligence map, opponent dossiers, and claims-gated research for staff.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanOppositionResearchPage() {
  return (
    <>
      <div className="ep-classification">Internal · Opposition research · Staff lane</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanOppositionResearchHubPanel />
        </div>
      </div>
    </>
  );
}
