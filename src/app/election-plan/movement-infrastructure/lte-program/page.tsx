import { CitizenVoicesLtePanel } from "@/components/election-plan/Phase187InfluencePanels";

export const metadata = {
  title: "Arkansas Citizen Voices | LTE Program | Kelly Grappe Victory Plan",
  robots: { index: false, follow: false },
};

export default function LteProgramPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7 · Arkansas Citizen Voices</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CitizenVoicesLtePanel />
        </div>
      </div>
    </>
  );
}
