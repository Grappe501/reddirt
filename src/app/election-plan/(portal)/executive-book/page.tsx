import Link from "next/link";

import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

import { ExecutiveBookHubPanel } from "@/components/election-plan/executive-book/ExecutiveBookHubPanel";

export const metadata = {
  title: "Executive Book V1.1 | Kelly Grappe Victory Plan",
  description: "Leadership briefing — shareable chapters for Kelly, campaign leadership, donors, validators, and coalition partners.",
  robots: { index: false, follow: false },
};

export default function ExecutiveBookHubPage() {
  const data = loadElectionPlanSnapshot();

  return (
    <>
      <div className="ep-classification">Executive Book V1.1 · Leadership Briefing · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ExecutiveBookHubPanel data={data} standalone />
        </div>
      </div>
    </>
  );
}
