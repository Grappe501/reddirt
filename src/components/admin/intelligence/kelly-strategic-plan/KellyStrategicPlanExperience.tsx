import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KELLY_STRATEGIC_PLAN_HUB_HREF,
  kellyStrategicPlanDocHref,
} from "@/lib/campaign-strategy/kelly-strategic-plan-nav";
import type { StrategyNavSection } from "@/lib/campaign-strategy/types";

function normalizeActiveKey(pathname: string): string {
  if (!pathname.startsWith(KELLY_STRATEGIC_PLAN_HUB_HREF)) return "";
  return pathname.slice(KELLY_STRATEGIC_PLAN_HUB_HREF.length).replace(/^\/+/, "");
}

export function KellyStrategicPlanExperience({
  nav,
  children,
}: {
  nav: StrategyNavSection[];
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const activeKey = normalizeActiveKey(pathname);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-white shadow-sm">
        <div className="border-b border-emerald-200/60 bg-kelly-deep px-6 py-8 text-white md:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-300/90">
            Intelligence · Kelly lane · Phase 11 P1
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Kelly SOS strategic plan</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
            22-chapter operating manual with Phase 11 P1 depth on every chapter — debate application, operator steps,
            and philosophy crosswalks wired to strategy command.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={KELLY_STRATEGIC_PLAN_HUB_HREF}
              className="rounded-full border border-emerald-400/40 bg-emerald-900/40 px-3 py-1 text-xs font-bold text-white"
            >
              Chapter inventory
            </Link>
            <Link
              href="/admin/intelligence/phase-11-p1-upgrade"
              className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
            >
              Phase 11 P1 pass
            </Link>
            <Link
              href="/admin/intelligence/strategy-philosophy-hub"
              className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
            >
              Strategy & philosophy
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <aside className="border-b border-kelly-text/10 bg-kelly-deep/97 px-4 py-5 text-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-[min(100%,280px)] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:self-start">
            <nav aria-label="Kelly strategic plan" className="space-y-5">
              {nav.map((section) => (
                <div key={section.id}>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{section.title}</p>
                  <ul className="mt-1 space-y-0.5">
                    {section.items.map((item) => {
                      const href = kellyStrategicPlanDocHref(item.path);
                      const isActive =
                        item.path === activeKey ||
                        (item.path === "" && activeKey === "") ||
                        (item.path !== "" && activeKey === item.path);
                      return (
                        <li key={item.path || "overview"}>
                          <Link
                            href={href}
                            className={`block rounded-lg px-2 py-1.5 text-[11px] font-medium leading-snug transition ${
                              isActive
                                ? "bg-kelly-gold/25 text-white ring-1 ring-kelly-gold/40"
                                : "text-white/80 hover:bg-white/10"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 flex-1 px-6 py-8 md:px-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
