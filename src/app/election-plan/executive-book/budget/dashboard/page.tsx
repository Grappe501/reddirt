import { ExecutiveBookBudgetDashboardPanel } from "@/components/election-plan/executive-book/ExecutiveBookBudgetDashboardPanel";

export const metadata = {
  title: "Budget Dashboard | Executive Book | Kelly Grappe Victory Plan",
  robots: { index: false, follow: false },
};

export default function ExecutiveBookBudgetDashboardPage() {
  return (
    <>
      <div className="ep-classification">Executive Book V1.1 · Phase 18.7A · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ExecutiveBookBudgetDashboardPanel />
        </div>
      </div>
    </>
  );
}
