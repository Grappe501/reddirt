import { ElectionPlanOppositionResearchHubPanel } from "@/components/election-plan/ElectionPlanOppositionResearchHubPanel";

export const metadata = {
  title: "Opposition Research | Election Plan",
  description: "Kelly debate-night card, Hammer intelligence, Pakko three-way guide, and claims-gated research.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanOppositionResearchPage() {
  return (
    <>
      <div className="ep-classification">Kelly + staff · Opposition research v2.0</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanOppositionResearchHubPanel />
        </div>
      </div>
    </>
  );
}
