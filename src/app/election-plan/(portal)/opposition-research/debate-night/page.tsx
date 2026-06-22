import { ElectionPlanOppositionDebateNightPanel } from "@/components/election-plan/ElectionPlanOppositionDebateNightPanel";

export const metadata = {
  title: "Debate Night Card | Opposition Research | Election Plan",
  description: "Kelly's 5-minute pre-stage opposition brief — export-ready lines, rebuttals, Pakko respect pivots.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanOppositionDebateNightPage() {
  return (
    <>
      <div className="ep-classification">Kelly · Debate night · Export-gated lines only</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanOppositionDebateNightPanel />
        </div>
      </div>
    </>
  );
}
