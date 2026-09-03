import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: {
    default: "Scheduler Dashboard",
    template: "%s · Scheduler",
  },
  robots: { index: false, follow: false },
};

export default function SchedulerRootLayout({ children }: { children: ReactNode }) {
  return children;
}
