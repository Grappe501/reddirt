import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: {
    absolute: "FEC donor and net-worth lists · Arkansas 2026",
  },
  robots: { index: false, follow: false },
};

export default async function FecMaxDonorsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f1e8] font-body text-kelly-text antialiased">{children}</div>
  );
}
