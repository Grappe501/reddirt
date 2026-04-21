import type { ReactNode } from "react";
import { AdminBoardShell } from "@/components/admin/AdminBoardShell";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminBoardLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return <AdminBoardShell>{children}</AdminBoardShell>;
}
