import { WeeklyLeadershipPacketPanel } from "@/components/election-plan/Phase187BOwnershipPanels";

export const metadata = {
  title: "Weekly Leadership Packet | Election Plan",
  robots: { index: false, follow: false },
};

export default function WeeklyPacketPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B · Monday packet</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <WeeklyLeadershipPacketPanel />
        </div>
      </div>
    </>
  );
}
