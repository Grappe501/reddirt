import { MeetingAccountabilityHubPanel } from "@/components/election-plan/Phase187EMeetingPanels";

export const metadata = {
  title: "Meeting & Accountability | Election Plan",
  robots: { index: false, follow: false },
};

export default function MeetingsHubPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7E · Campaign Operating Manual · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <MeetingAccountabilityHubPanel />
        </div>
      </div>
    </>
  );
}
