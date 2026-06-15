import { HowWeWinCandidatePanel } from "@/components/election-plan/HowWeWinCandidatePanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { HOW_WE_WIN_CANDIDATE } from "@/lib/election-plan/how-we-win-candidate-content";

export const metadata = {
  title: "How We Win · Candidate Version | Kelly Grappe Victory Plan",
  description: HOW_WE_WIN_CANDIDATE.tagline,
  robots: { index: false, follow: false },
};

export default function HowWeWinCandidateVersionPage() {
  const data = loadElectionPlanSnapshot();

  return (
    <>
      <div className="ep-classification">Internal · Candidate brief · Every room</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <HowWeWinCandidatePanel data={data} standalone />
        </div>
      </div>
    </>
  );
}
