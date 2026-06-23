import { ElectionPlanDebateAnatomyPanel } from "@/components/election-plan/ElectionPlanDebateAnatomyPanel";

export const metadata = {
  title: "Debate Anatomy | Debate Command Course",
  description: "How a Secretary of State debate is structured — stage order, timing, and module preparation map.",
  robots: { index: false, follow: false },
};

export default function DebatePrepAnatomyPage() {
  return (
    <>
      <div className="ep-classification">Debate Command Course · Structure reference</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <ElectionPlanDebateAnatomyPanel />
        </div>
      </div>
    </>
  );
}
