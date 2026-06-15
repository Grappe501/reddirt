import { CampaignOrganizationPanel } from "@/components/election-plan/CampaignOrganizationPanel";

export const metadata = {
  title: "Campaign Organization | Election Plan",
  robots: { index: false, follow: false },
};

export default function CampaignOrganizationPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7D · Campaign Operating Manual · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <CampaignOrganizationPanel />
        </div>
      </div>
    </>
  );
}
