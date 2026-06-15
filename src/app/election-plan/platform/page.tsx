import { KellySosPlatformPanel } from "@/components/election-plan/KellySosPlatformPanel";
import { KELLY_SOS_PLATFORM } from "@/lib/election-plan/kelly-sos-platform";

export const metadata = {
  title: "Kelly Grappe SOS Platform | Victory Plan",
  description: KELLY_SOS_PLATFORM.subtitle,
  robots: { index: false, follow: false },
};

export default function KellySosPlatformPage() {
  return (
    <>
      <div className="ep-classification">Internal · Governing platform · Secretary of State</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <KellySosPlatformPanel standalone />
        </div>
      </div>
    </>
  );
}
