import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: {
    absolute: "FEC donor lists · Arkansas 2026",
  },
  robots: { index: false, follow: false },
};

export default async function FecMaxDonorsLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return (
    <div className="min-h-screen bg-[#f6f1e8] font-body text-kelly-text antialiased">{children}</div>
  );
}
