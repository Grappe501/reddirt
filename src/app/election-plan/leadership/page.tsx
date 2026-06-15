import { LeadershipHubPanel } from "@/components/election-plan/Phase187BOwnershipPanels";

export const metadata = {
  title: "Leadership & Ownership | Election Plan",
  robots: { index: false, follow: false },
};

export default function LeadershipHubPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B · Leadership</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <LeadershipHubPanel />
        </div>
      </div>
    </>
  );
}
