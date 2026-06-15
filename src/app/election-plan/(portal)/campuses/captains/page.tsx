import { CampusCaptainDashboardPanel } from "@/components/election-plan/Phase187InfluencePanels";

export const metadata = {
  title: "Campus Captains | Campus Network | Kelly Grappe Victory Plan",
  robots: { index: false, follow: false },
};

export default function CampusCaptainsPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.1 · Campus Captains</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <CampusCaptainDashboardPanel />
        </div>
      </div>
    </>
  );
}
