import { CountyVictoryTargetsExecutivePanel } from "@/components/election-plan/CountyVictoryTargetsPanel";

export const metadata = {
  title: "County Victory Targets | Election Plan",
  robots: { index: false, follow: false },
};

export default function CountyVictoryTargetsPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7G · County Victory Targets · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CountyVictoryTargetsExecutivePanel />
        </div>
      </div>
    </>
  );
}
