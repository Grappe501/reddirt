import Link from "next/link";
import type { ReactNode } from "react";
import { adminLogoutAction } from "@/app/admin/actions";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { DEBATE_WEEK_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";

/**
 * Minimal admin chrome for debate launch — no nav bundle, AI palette, or tenant resolution.
 */
export function IntelligenceLaunchBoardShell({
  children,
  currentPathname = "/admin/intelligence",
}: {
  children: ReactNode;
  currentPathname?: string;
}) {
  const path = currentPathname.split("?")[0] ?? "/admin/intelligence";

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-kelly-text">
      <aside className="flex w-[min(100%,260px)] flex-col border-r border-[var(--border-on-navy)] bg-kelly-text text-kelly-inverse">
        <div className="border-b border-[var(--border-on-navy)] px-4 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-inverse-muted">Debate week</p>
          <p className="mt-2 font-heading text-base font-bold leading-tight">Intelligence workbench</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3" aria-label="Debate week">
          {DEBATE_WEEK_NAV_ITEMS.map((item) => {
            const active = path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 font-body text-sm font-medium transition ${
                  active ? "bg-kelly-page/15 text-kelly-page" : "text-kelly-inverse-soft hover:bg-kelly-page/10 hover:text-kelly-page"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border-on-navy)] p-3">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-[var(--border-on-navy)] px-3 py-2 font-body text-xs font-semibold uppercase tracking-wider text-kelly-inverse transition hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <div className="border-t border-kelly-border bg-kelly-wash px-4 py-3 lg:px-8">
          <CampaignPaidForBar variant="light" />
        </div>
      </div>
    </div>
  );
}
