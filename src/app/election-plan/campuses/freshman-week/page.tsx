import { FreshmanWeekReadinessPanel } from "@/components/election-plan/Phase187InfluencePanels";

export const metadata = {
  title: "Freshman Week Readiness | Campus Network | Kelly Grappe Victory Plan",
  robots: { index: false, follow: false },
};

export default function FreshmanWeekReadinessPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.9 · Freshman Week</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <FreshmanWeekReadinessPanel />
        </div>
      </div>
    </>
  );
}
