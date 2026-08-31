import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public-hub Netlify builds stash `admin/(board)/layout.tsx`.
 * This nested layout keeps Talent Foundry behind the same admin gate.
 */
export default async function TalentFoundryAdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return children;
}
