"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
  campaignSystemDocHref,
  type CampaignSystemNavSection,
} from "@/lib/campaign-strategy/campaign-system-nav-shared";

function normalizeActiveKey(pathname: string): string {
  const prefix = CAMPAIGN_SYSTEM_MANUAL_HUB_HREF;
  if (!pathname.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length).replace(/^\/+/, "");
  return rest;
}

type CampaignSystemManualExperienceProps = {
  nav: CampaignSystemNavSection[];
  children: ReactNode;
};

export function CampaignSystemManualExperience({ nav, children }: CampaignSystemManualExperienceProps) {
  const pathname = usePathname() ?? "";
  const activeKey = normalizeActiveKey(pathname);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-b from-violet-50/40 to-white shadow-sm">
        <div className="border-b border-violet-200/60 bg-violet-950 px-6 py-8 text-white md:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-violet-300">
            Intelligence · Staff lane · Phase 11
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Campaign system manual</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-violet-100/90">
            252 operational strategy documents — now browsable in intelligence, not agent-chunks only. Category guides
            cross-link to debate prep, strategy command, and Field Book promotion workflow.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={CAMPAIGN_SYSTEM_MANUAL_HUB_HREF}
              className="rounded-full border border-violet-400/40 bg-violet-900/50 px-3 py-1 text-xs font-bold text-white hover:bg-violet-800"
            >
              Hub & inventory
            </Link>
            <Link
              href="/admin/intelligence/phase-11-upgrade"
              className="rounded-full border border-violet-400/40 px-3 py-1 text-xs font-bold text-violet-200 hover:bg-violet-900/50"
            >
              Phase 11 upgrade
            </Link>
            <Link
              href="/admin/intelligence/strategy-philosophy-hub"
              className="rounded-full border border-violet-400/40 px-3 py-1 text-xs font-bold text-violet-200 hover:bg-violet-900/50"
            >
              Strategy & philosophy
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <aside className="border-b border-violet-100 bg-violet-950/95 px-4 py-5 text-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-[min(100%,280px)] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:self-start">
            <nav aria-label="Campaign system manual" className="space-y-5">
              {nav.map((section) => (
                <div key={section.id}>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                    {section.title} ({section.items.length})
                  </p>
                  <ul className="mt-1 max-h-48 space-y-0.5 overflow-y-auto lg:max-h-56">
                    {section.items.slice(0, 40).map((item) => {
                      const href = campaignSystemDocHref(item.pathKey);
                      const isActive = item.pathKey === activeKey;
                      return (
                        <li key={item.pathKey}>
                          <Link
                            href={href}
                            className={`block rounded-lg px-2 py-1.5 text-[11px] font-medium leading-snug transition ${
                              isActive
                                ? "bg-violet-500/30 text-white ring-1 ring-violet-400/50"
                                : "text-violet-100/85 hover:bg-white/10"
                            }`}
                            title={item.label}
                          >
                            {item.label.length > 52 ? `${item.label.slice(0, 50)}…` : item.label}
                          </Link>
                        </li>
                      );
                    })}
                    {section.items.length > 40 ? (
                      <li className="px-2 py-1 text-[10px] text-violet-400">
                        +{section.items.length - 40} more on hub
                      </li>
                    ) : null}
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
