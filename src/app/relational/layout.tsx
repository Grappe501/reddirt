import type { ReactNode } from "react";
import Link from "next/link";

import { getRelationalUserIdFromCookies } from "@/lib/campaign/relational-user-session";

import { signOutRelationalUserAction } from "./session-actions";

export default async function RelationalLayout({ children }: { children: ReactNode }) {
  const userId = await getRelationalUserIdFromCookies();
  return (
    <div className="min-h-dvh bg-cream-canvas text-deep-soil">
      <header className="border-b border-deep-soil/10 bg-cream-canvas/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-red-dirt hover:underline">
              ← Home
            </Link>
            {userId ? (
              <Link
                href="/relational"
                className="font-heading text-lg font-bold text-deep-soil"
              >
                My relationships
              </Link>
            ) : (
              <span className="font-heading text-lg font-bold text-deep-soil">Relationships</span>
            )}
          </div>
          {userId ? (
            <form action={signOutRelationalUserAction}>
              <button
                type="submit"
                className="rounded border border-deep-soil/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-deep-soil/80 hover:bg-deep-soil/5"
              >
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>
    </div>
  );
}
