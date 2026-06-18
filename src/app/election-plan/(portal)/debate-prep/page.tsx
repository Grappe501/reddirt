import { ElectionPlanDebatePrepHubPanel } from "@/components/election-plan/ElectionPlanDebatePrepHubPanel";

export const metadata = {
  title: "Debate Prep | Election Plan",
  description: "SOS debate command course, forum transcript lab, and rehearsal surfaces for Kelly and staff.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebatePrepPage() {
  return (
    <>
      <div className="ep-classification">Internal · Debate prep · Election Plan OS</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepHubPanel />
        </div>
      </div>
    </>
  );
}
