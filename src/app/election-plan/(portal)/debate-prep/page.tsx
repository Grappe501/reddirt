import { ElectionPlanDebateCourseHubPanel } from "@/components/election-plan/ElectionPlanDebateCourseHubPanel";
import { ElectionPlanDebatePrepHubPanel } from "@/components/election-plan/ElectionPlanDebatePrepHubPanel";
import { shouldShowDebateCourseHubV9 } from "@/lib/election-plan/kelly-facing-ui";

export const metadata = {
  title: "Debate Command Course | Election Plan",
  description:
    "Eight-module Secretary of State debate command course — clear pathways, progress tracking, extended answer bank, and three-hour stage replay.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebatePrepPage() {
  const studentCourse = shouldShowDebateCourseHubV9();

  return (
    <>
      <div className="ep-classification">
        {studentCourse ? "Debate Command Course · v9" : "Internal · Debate prep · Election Plan OS"}
      </div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {studentCourse ? <ElectionPlanDebateCourseHubPanel /> : <ElectionPlanDebatePrepHubPanel />}
        </div>
      </div>
    </>
  );
}
