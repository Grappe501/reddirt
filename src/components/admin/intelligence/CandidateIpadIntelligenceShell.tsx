"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  CANDIDATE_IPAD_MORE_LINKS,
  CANDIDATE_IPAD_PRIMARY_NAV,
  CANDIDATE_IPAD_PROFILE,
} from "@/lib/intelligence/candidateIpadMode";
import { IntelligenceAgentCopilotDock } from "@/components/admin/intelligence/IntelligenceAgentCopilotDock";

function isActive(pathname: string, href: string) {
  const p = pathname.replace(/\/$/, "") || "/admin/intelligence";
  const h = href.replace(/\/$/, "");
  return p === h || p.startsWith(`${h}/`);
}

export function CandidateIpadIntelligenceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [moreOpen, setMoreOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  return (
    <div
      className="candidate-ipad-intel mx-auto min-h-[100dvh] max-w-[820px] bg-kelly-page pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
      data-candidate-ipad="true"
    >
      <header className="sticky top-0 z-30 border-b border-kelly-text/10 bg-kelly-page/95 px-4 py-2 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-subtle">
          {CANDIDATE_IPAD_PROFILE.label} · debate prep
        </p>
        <p className="text-[10px] text-amber-900">INTERNAL — verify acts before stage</p>
      </header>

      <main className="candidate-ipad-main px-4 py-4 touch-manipulation [&_button]:min-h-12 [&_a.rounded-full]:inline-flex [&_a.rounded-full]:min-h-11 [&_a.rounded-full]:items-center">
        {children}
      </main>

      {moreOpen ? (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40"
          role="dialog"
          aria-label="More intelligence tools"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="max-h-[70dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold text-kelly-navy">More tools</p>
            <ul className="mt-3 space-y-2">
              {CANDIDATE_IPAD_MORE_LINKS.map((link) => (
                <li key={link.href}>
                  <IntelligenceNavLink
                    href={link.href}
                    variant="ipad"
                    onClick={() => setMoreOpen(false)}
                    className="flex min-h-12 items-center rounded-xl border border-kelly-text/10 px-4 text-sm font-bold text-kelly-navy active:bg-kelly-page"
                  >
                    {link.label}
                  </IntelligenceNavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {agentOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50"
          role="dialog"
          aria-label="AI prep assistant"
          onClick={() => setAgentOpen(false)}
        >
          <div
            className="max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-kelly-navy">AI prep assistant</p>
              <button
                type="button"
                onClick={() => setAgentOpen(false)}
                className="min-h-11 min-w-11 rounded-lg border px-3 text-sm font-bold"
              >
                Close
              </button>
            </div>
            <IntelligenceAgentCopilotDock embedded />
          </div>
        </div>
      ) : null}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[820px] border-t border-kelly-text/15 bg-white/98 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Candidate iPad navigation"
      >
        <div className="grid grid-cols-8 gap-0">
          {CANDIDATE_IPAD_PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <IntelligenceNavLink
                key={item.href}
                href={item.href}
                variant="ipad"
                className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold leading-tight active:bg-violet-50 ${
                  active ? "text-violet-950" : "text-kelly-subtle"
                }`}
              >
                <span className={`h-1 w-8 rounded-full ${active ? "bg-violet-700" : "bg-transparent"}`} />
                {item.shortLabel}
              </IntelligenceNavLink>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              setAgentOpen(true);
            }}
            className="flex min-h-[52px] flex-col items-center justify-center text-[10px] font-bold text-violet-900 active:bg-violet-50"
          >
            AI
          </button>
          <button
            type="button"
            onClick={() => {
              setAgentOpen(false);
              setMoreOpen(true);
            }}
            className="flex min-h-[52px] flex-col items-center justify-center text-[10px] font-bold text-kelly-navy active:bg-kelly-page"
          >
            More
          </button>
        </div>
      </nav>
    </div>
  );
}
