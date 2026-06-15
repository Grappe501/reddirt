import { PowerOf5CommandCenterPanel } from "@/components/election-plan/Phase187BOwnershipPanels";

export const metadata = {
  title: "Power of 5 Command Center | Election Plan",
  robots: { index: false, follow: false },
};

export default function PowerOf5CommandCenterPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B · Power of 5</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <PowerOf5CommandCenterPanel />
        </div>
      </div>
    </>
  );
}
