import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { KickoffShell } from "@/components/volunteer-kickoff/KickoffShell";

export const metadata: Metadata = {
  title: {
    absolute: "Statewide Volunteer Leadership Kickoff | Kelly Grappe",
  },
  description:
    "Guided one-hour volunteer leadership presentation — follow along and choose how you will help build the campaign county by county.",
  robots: { index: false, follow: false },
};

export default function VolunteerKickoffLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[var(--kelly-fog)] font-body text-[var(--kelly-official-navy)]">
          Loading presentation…
        </div>
      }
    >
      <KickoffShell>{children}</KickoffShell>
    </Suspense>
  );
}
