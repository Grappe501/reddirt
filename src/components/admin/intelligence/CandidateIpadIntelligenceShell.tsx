"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import { CandidateIpadSectionSheet } from "@/components/admin/intelligence/CandidateIpadSectionSheet";
import { CandidateIpadDrillPlayerBottomNavBridge } from "@/components/admin/intelligence/CandidateIpadDrillPlayerBottomNavBridge";
import { IntelligenceAgentCopilotDock } from "@/components/admin/intelligence/IntelligenceAgentCopilotDock";
import { IntelligencePrepSearchBar } from "@/components/admin/intelligence/IntelligencePrepSearchBar";
import { IntelligencePrepSearchHeaderButton } from "@/components/admin/intelligence/IntelligencePrepSearchHeaderButton";
import {
  CANDIDATE_IPAD_PROFILE,
} from "@/lib/intelligence/candidateIpadMode";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import {
  getIpadCceSection,
  listIpadBottomNavTabs,
  resolveIpadActiveSectionId,
  type IpadCceSectionId,
} from "@/lib/intelligence/v4/phase15P7IpadPolish";
import { isIpadDrillPlayerRoute } from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";
import { resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";

export function CandidateIpadIntelligenceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const profile = resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());
  const tabs = useMemo(() => listIpadBottomNavTabs(profile), [profile]);
  const activeSection = useMemo(() => resolveIpadActiveSectionId(pathname, profile), [pathname, profile]);
  const drillPlayerActive = isIpadDrillPlayerRoute(pathname);
  const [sheetSection, setSheetSection] = useState<IpadCceSectionId | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);

  const openSection = sheetSection ? getIpadCceSection(sheetSection, profile) : undefined;

  function handleTabPress(sectionId: IpadCceSectionId, primaryHref: string) {
    if (sectionId === "home") {
      setSheetSection(null);
      router.push(primaryHref);
      return;
    }
    setSheetSection(sectionId);
  }

  return (
    <div
      className={`candidate-ipad-intel mx-auto min-h-[100dvh] max-w-[820px] bg-kelly-page ${
        drillPlayerActive
          ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
          : "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
      }`}
      data-candidate-ipad="true"
      data-phase15-p7="true"
      data-phase16-p5={drillPlayerActive ? "drill-player" : undefined}
    >
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-kelly-text/10 bg-kelly-page/95 px-4 py-2 backdrop-blur-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-subtle">
            {CANDIDATE_IPAD_PROFILE.label} · Phase 15 CCE
          </p>
          <p className="text-[10px] text-amber-900">
            {drillPlayerActive ? "Drill player · Exit · Prev · Next · Timer" : "Five sections · verify before stage"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IntelligencePrepSearchHeaderButton />
          <button
            type="button"
            onClick={() => setAgentOpen(true)}
            className="min-h-11 rounded-lg border border-violet-300 bg-violet-50 px-3 text-[10px] font-bold text-violet-950"
          >
            AI prep
          </button>
        </div>
      </header>

      <IntelligencePrepSearchBar variant="ipad-header" />

      <main className="candidate-ipad-main px-4 py-4 touch-manipulation [&_button]:min-h-12 [&_a.rounded-full]:inline-flex [&_a.rounded-full]:min-h-11 [&_a.rounded-full]:items-center">
        {children}
      </main>

      {openSection && !drillPlayerActive ? (
        <CandidateIpadSectionSheet section={openSection} onClose={() => setSheetSection(null)} />
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

      {drillPlayerActive ? (
        <CandidateIpadDrillPlayerBottomNavBridge />
      ) : (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[820px] border-t border-kelly-text/15 bg-white/98 backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          aria-label="Candidate iPad CCE navigation"
        >
          <IntelligencePrepSearchBar variant="trigger-only" listenOnOpen={false} />
          <div className="grid grid-cols-5 gap-0">
            {tabs.map((tab) => {
              const active = activeSection === tab.sectionId || sheetSection === tab.sectionId;
              if (tab.sectionId === "home") {
                return (
                  <IntelligenceNavLink
                    key={tab.sectionId}
                    href={tab.primaryHref}
                    variant="ipad"
                    className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold leading-tight active:bg-indigo-50 ${
                      active ? "text-indigo-950" : "text-kelly-subtle"
                    }`}
                  >
                    <span className={`h-1 w-8 rounded-full ${active ? "bg-indigo-700" : "bg-transparent"}`} />
                    {tab.shortLabel}
                  </IntelligenceNavLink>
                );
              }
              return (
                <button
                  key={tab.sectionId}
                  type="button"
                  onClick={() => handleTabPress(tab.sectionId, tab.primaryHref)}
                  className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold leading-tight active:bg-violet-50 ${
                    active ? "text-violet-950" : "text-kelly-subtle"
                  }`}
                >
                  <span className={`h-1 w-8 rounded-full ${active ? "bg-violet-700" : "bg-transparent"}`} />
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
