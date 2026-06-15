import { LaborDayResourceGapPanel } from "@/components/election-plan/LaborDayResourceGapPanel";

export const metadata = {
  title: "Labor Day Resource Gap | Executive Book | Kelly Grappe Victory Plan",
  robots: { index: false, follow: false },
};

export default function LaborDayResourceGapPage() {
  return (
    <>
      <div className="ep-classification">Executive Book V1.1 · Phase 18.7A · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <LaborDayResourceGapPanel />
        </div>
      </div>
    </>
  );
}
