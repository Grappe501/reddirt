import type { ReactNode } from "react";
import Link from "next/link";

import { getRelationalUserIdFromCookies } from "@/lib/campaign/relational-user-session";

import { signOutRelationalUserAction } from "./session-actions";

export default async function RelationalLayout({ children }: { children: ReactNode }) {
  const userId = await getRelationalUserIdFromCookies();
  return (
    <div className="min-h-dvh bg-kelly-page text-kelly-text">
      <header className="border-b border-kelly-text/10 bg-kelly-page/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-kelly-navy hover:underline">
              ← Home
            </Link>
            {userId ? (
              <Link
                href="/relational"
                className="font-heading text-lg font-bold text-kelly-text"
              >
                My relationships
              </Link>
            ) : (
              <span className="font-heading text-lg font-bold text-kelly-text">Relationships</span>
            )}
          </div>
          {userId ? (
            <form action={signOutRelationalUserAction}>
              <button
                type="submit"
                className="rounded border border-kelly-text/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-kelly-text/80 hover:bg-kelly-text/5"
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
