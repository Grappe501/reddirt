import { IntelligenceOpportunitiesPanel } from "@/components/election-plan/IntelligenceOpportunitiesPanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Intelligence Opportunities | Kelly Grappe Victory Plan",
  description:
    "Forward Motion scored stops — where the campaign should go next, what to activate, and what is still missing.",
  robots: { index: false, follow: false },
};

export default function IntelligenceOpportunitiesPage() {
  const data = loadElectionPlanSnapshot();

  return (
    <>
      <div className="ep-classification">Internal · Forward Motion · Decision intelligence queue</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <IntelligenceOpportunitiesPanel forwardMotion={data.forwardMotion} standalone />
        </div>
      </div>
    </>
  );
}
