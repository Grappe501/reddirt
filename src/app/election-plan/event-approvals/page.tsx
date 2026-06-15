import { EventApprovalsPanel } from "@/components/election-plan/EventApprovalsPanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Event Approvals | Kelly Grappe Victory Plan",
  description:
    "Leadership approval portal — Kelly attendance, volunteer coverage, and calendar truth for campaign events.",
  robots: { index: false, follow: false },
};

export default function EventApprovalsPage() {
  const data = loadElectionPlanSnapshot();

  return (
    <>
      <div className="ep-classification">Internal · Calendar Truth · Leadership approval queue</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <EventApprovalsPanel data={data.eventApprovals} standalone />
        </div>
      </div>
    </>
  );
}
