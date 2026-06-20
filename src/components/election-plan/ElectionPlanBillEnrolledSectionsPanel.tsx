"use client";

import { useState } from "react";

import { DebateDeepLinkText } from "@/components/election-plan/DebateDeepLinkText";
import type { BillEnrolledActRecord } from "@/lib/intelligence/v4/hammerBillEnrolledSections";

export function ElectionPlanBillEnrolledSectionsPanel({
  enrolledAct,
  variant = "election-plan",
}: {
  enrolledAct: BillEnrolledActRecord;
  variant?: "election-plan" | "admin";
}) {
  const [openSection, setOpenSection] = useState<number | null>(enrolledAct.sections[0]?.sectionNumber ?? null);

  const cardClass = variant === "admin" ? "rounded-xl border border-kelly-text/15 bg-white" : "ep-card";

  return (
    <section className={`${cardClass} p-5 text-sm`}>
      <p className="text-xs font-bold uppercase text-[var(--ep-gold,var(--kelly-gold))]">
        Enrolled act — full wording &amp; section analysis
      </p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted,var(--kelly-muted))]">
        Statutory text extracted from Arkleg Act {enrolledAct.actNumber} PDF — stay in-app for research. Run each
        penalty or fraud claim through claims gate before stage use.
      </p>
      <p className="mt-2 text-xs">
        <a
          href={enrolledAct.arklegActPdfUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline text-[var(--ep-navy,var(--kelly-navy))]"
        >
          Official enrolled PDF ↗
        </a>
        {" · "}
        {enrolledAct.sections.length} section{enrolledAct.sections.length === 1 ? "" : "s"}
      </p>

      <div className="mt-5 space-y-3">
        {enrolledAct.sections.map((section) => {
          const isOpen = openSection === section.sectionNumber;
          return (
            <article
              key={section.sectionNumber}
              className="overflow-hidden rounded-lg border border-[var(--ep-border,var(--kelly-text)/15)] bg-[var(--ep-cream,var(--kelly-page))]/40"
            >
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.sectionNumber)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ep-navy-muted,var(--kelly-muted))]">
                    Section {section.sectionNumber}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--ep-navy,var(--kelly-text))]">
                    <DebateDeepLinkText text={section.heading.slice(0, 200) + (section.heading.length > 200 ? "…" : "")} />
                  </p>
                </div>
                <span className="shrink-0 text-lg leading-none text-[var(--ep-navy-muted,var(--kelly-muted))]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen ? (
                <div className="space-y-4 border-t border-[var(--ep-border,var(--kelly-text)/10)] px-4 py-4 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-700">Full enrolled wording</p>
                    <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-[var(--ep-navy,var(--kelly-text))]">
                      {section.statutoryText}
                    </pre>
                  </div>

                  <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4">
                    <p className="text-[10px] font-bold uppercase text-sky-900">Plain English</p>
                    <p className="mt-2 text-[var(--ep-navy,var(--kelly-text))]">
                      <DebateDeepLinkText text={section.plainEnglish} />
                    </p>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                      <p className="text-[10px] font-bold uppercase text-emerald-900">Kelly frame</p>
                      <p className="mt-2 text-[var(--ep-navy,var(--kelly-text))]">
                        <DebateDeepLinkText text={section.kellyFrame} />
                      </p>
                    </div>
                    <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3">
                      <p className="text-[10px] font-bold uppercase text-rose-900">Hammer will say</p>
                      <p className="mt-2 italic text-[var(--ep-navy-muted,var(--kelly-muted))]">
                        &ldquo;{section.hammerLikelyClaim}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-3">
                    <p className="text-[10px] font-bold uppercase text-violet-950">County / voter impact</p>
                    <p className="mt-2 text-[var(--ep-navy,var(--kelly-text))]">
                      <DebateDeepLinkText text={section.countyImpact} />
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--ep-gold,var(--kelly-gold))]/40 bg-[var(--ep-cream,var(--kelly-page))]/60 p-3">
                    <p className="text-[10px] font-bold uppercase text-[var(--ep-gold,var(--kelly-gold))]">
                      Debate move — rehearse this
                    </p>
                    <p className="mt-2 font-semibold text-[var(--ep-navy,var(--kelly-text))]">
                      <DebateDeepLinkText text={section.debateMove} />
                    </p>
                  </div>

                  <p className="text-[10px] text-amber-900">
                    <span className="font-bold">Claims gate:</span> {section.claimsGate}
                  </p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
