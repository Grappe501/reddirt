import type { ReactNode } from "react";

export default function ComplianceLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#eef1f6] pb-16">{children}</div>;
}
