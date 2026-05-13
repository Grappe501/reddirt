import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminBoardShell } from "@/components/admin/AdminBoardShell";
import { KellyCalendarCockpitChrome } from "@/components/admin/kelly-calendar-cockpit/KellyCalendarCockpitChrome";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminBoardLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  const path = (await headers()).get("x-pathname") ?? "";
  if (path.startsWith("/admin/calendar-command-center/kelly")) {
    return <KellyCalendarCockpitChrome>{children}</KellyCalendarCockpitChrome>;
  }
  return <AdminBoardShell>{children}</AdminBoardShell>;
}
