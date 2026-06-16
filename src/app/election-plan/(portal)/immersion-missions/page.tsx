import { ImmersionMissionsHubPanel } from "@/components/election-plan/ImmersionMissionsHubPanel";

export const metadata = {
  title: "Immersion County Missions | Campaign Doctrine | Election Plan",
  robots: { index: false, follow: false },
};

export default function ImmersionMissionsPage() {
  return (
    <>
      <div className="ep-classification">Campaign Doctrine · One mission per immersion county · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <ImmersionMissionsHubPanel />
        </div>
      </div>
    </>
  );
}
