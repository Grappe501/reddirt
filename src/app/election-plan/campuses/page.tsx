import { CampusNetworkDashboardPanel } from "@/components/election-plan/CampusNetworkPanels";

export const metadata = {
  title: "Arkansas Campus Network | Election Plan",
  robots: { index: false, follow: false },
};

export default function CampusesHubPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18 · Campus Network</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <CampusNetworkDashboardPanel />
        </div>
      </div>
    </>
  );
}
