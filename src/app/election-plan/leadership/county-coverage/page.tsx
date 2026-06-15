import { CountyLeadershipCoveragePanel } from "@/components/election-plan/Phase187BOwnershipPanels";

export const metadata = {
  title: "County Leadership Coverage | Election Plan",
  robots: { index: false, follow: false },
};

export default function CountyCoveragePage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B · 75 counties</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CountyLeadershipCoveragePanel />
        </div>
      </div>
    </>
  );
}
