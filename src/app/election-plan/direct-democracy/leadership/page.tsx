import { DirectDemocracyLeadershipPanel } from "@/components/election-plan/Phase187BOwnershipPanels";

export const metadata = {
  title: "Direct Democracy Leadership | Election Plan",
  robots: { index: false, follow: false },
};

export default function DirectDemocracyLeadershipPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B · Ballot Initiative Support</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <DirectDemocracyLeadershipPanel />
        </div>
      </div>
    </>
  );
}
