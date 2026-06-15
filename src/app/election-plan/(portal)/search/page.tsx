import { Suspense } from "react";

import { ElectionPlanSearchPanel } from "@/components/election-plan/ElectionPlanSearchPanel";

export const metadata = {
  title: "Search | Election Plan",
  robots: { index: false, follow: false },
};

export default function ElectionPlanSearchPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7H · Executive Search · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<p className="text-sm italic">Loading search…</p>}>
            <ElectionPlanSearchPanel />
          </Suspense>
        </div>
      </div>
    </>
  );
}
