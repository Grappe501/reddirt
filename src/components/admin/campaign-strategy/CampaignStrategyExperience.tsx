"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { STRATEGY_NAV } from "@/lib/campaign-strategy/nav";

function normalizeActiveKey(pathname: string): string {
  const prefix = "/admin/campaign-strategy";
  if (!pathname.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length).replace(/^\/+/, "");
  return rest;
}

export function CampaignStrategyExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const activeKey = normalizeActiveKey(pathname);

  return (
    <div className="-mx-6 -mt-4 lg:-mx-12">
      <div className="rounded-2xl border border-kelly-text/10 bg-gradient-to-b from-white via-kelly-fog/40 to-kelly-mist/30 shadow-[var(--shadow-card)] print:shadow-none print:border-kelly-text/20">
        <div className="border-b border-kelly-text/10 bg-kelly-deep px-6 py-8 text-white print:hidden md:px-10 md:py-10">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.32em] text-white/55">
            Internal · Strategic layer
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Campaign Strategy
          </h1>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-white/75 md:text-base">
            Kelly Grappe for Arkansas Secretary of State — operating manual in navigable form. Corporate pacing,
            GOTV-integrated programs, and LANE targets for finance and field alignment.
          </p>
          <div className="mt-6 h-px w-24 bg-kelly-gold/80" aria-hidden />
        </div>

        <div className="flex flex-col lg:flex-row">
          <aside className="border-b border-kelly-text/10 bg-kelly-deep/97 px-4 py-6 text-white print:hidden lg:sticky lg:top-4 lg:z-10 lg:max-h-[calc(100vh-2rem)] lg:w-[min(100%,300px)] lg:shrink-0 lg:overflow-y-auto lg:overscroll-y-contain lg:border-b-0 lg:border-r lg:border-kelly-text/10 lg:px-5 lg:self-start">
            <nav aria-label="Campaign strategy" className="space-y-6">
              {STRATEGY_NAV.map((section) => (
                <div key={section.id}>
                  <p className="px-2 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    {section.title}
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const href =
                        item.path === "" ? "/admin/campaign-strategy" : `/admin/campaign-strategy/${item.path}`;
                      const isActive =
                        item.path === activeKey ||
                        (item.path === "" && activeKey === "") ||
                        (item.path !== "" && activeKey === item.path);
                      return (
                        <li key={item.path || "hub"}>
                          <Link
                            href={href}
                            className={`block rounded-lg px-3 py-2.5 font-body text-sm font-medium transition ${
                              isActive
                                ? "bg-kelly-gold/20 text-white ring-1 ring-kelly-gold/50"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
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
            <p className="mt-8 border-t border-white/10 px-2 pt-6 font-body text-[11px] leading-relaxed text-white/45">
              Source docs:{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/70">
                docs/kelly-grappe-sos-strategic-plan-manual/
              </code>{" "}
              (this reader) ·{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/70">
                campaign-system-manual/
              </code>{" "}
              (agent chunks +{" "}
              <Link href="/admin/intelligence/campaign-system-manual" className="underline">
                intelligence reader
              </Link>
              )
            </p>
            <details className="mt-4 border-t border-white/10 px-2 pt-4 text-white/55">
              <summary className="cursor-pointer select-none font-body text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                Strategy partner · AI chunks
              </summary>
              <p className="mt-3 font-body text-[11px] leading-relaxed text-white/45">
                In-app chat (above) posts to{" "}
                <code className="break-all rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/65">
                  /api/admin/campaign-strategy/strategy-partner
                </code>{" "}
                with the same chunk retrieval boundaries. Raw index:&nbsp;
                <code className="break-all rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/65">
                  /api/admin/campaign-strategy/chunks
                </code>
                . Filter with{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">?pathKey=lane</code>, limit corpus with{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">?manualDomain=campaign-system</code>, fetch one with{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">?id=…</code>, add{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">&include=body</code> for Markdown.
                Overview chapter uses <code className="text-[10px]">__root__</code> in chunk ids.
              </p>
              <p className="mt-3 font-body text-[11px] leading-relaxed text-white/45">
                <strong className="text-white/55">County rollups (no voter rows):</strong>{" "}
                <code className="break-all rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/65">
                  /api/admin/voter-modeling/chunks
                </code>
                — latest COMPLETE snapshot&apos;s <code className="text-[10px]">CountyVoterMetrics</code>. Hard path
                steps: <code className="text-[10px]">docs/VOTER_MODELING_HARD_PATH.md</code>.
              </p>
            </details>
          </aside>

          <div className="min-w-0 flex-1 px-5 py-8 print:px-2 md:px-10 md:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
