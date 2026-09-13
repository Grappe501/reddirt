import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Auth for the visitor desk when the heavy (board) shell is stashed on Netlify.
 * Locally this runs under AdminBoardShell as well; requireAdminPage is idempotent.
 */
export default async function SiteAnalyticsLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return children;
}
