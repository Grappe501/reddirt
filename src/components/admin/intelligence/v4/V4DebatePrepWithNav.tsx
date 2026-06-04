"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { V3DebatePrepSection } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import { getPrepSectionGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { resolvePrepSectionHref } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";

export function V4DebatePrepWithNav({ sections }: { sections: V3DebatePrepSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(`v4-prep-${s.id}`))
      .filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id.replace("v4-prep-", ""));
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav className="lg:sticky lg:top-4 lg:h-fit lg:w-56 shrink-0">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
          {sections.length} sections · full drill-down each
        </p>
        <ul className="max-h-[70vh] space-y-1 overflow-y-auto rounded-xl border border-kelly-text/10 bg-white p-2 text-[10px]">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#v4-prep-${section.id}`}
                className={`block rounded px-2 py-1.5 font-semibold leading-snug ${
                  activeId === section.id ? "bg-violet-100 text-violet-950" : "text-kelly-muted hover:bg-kelly-page"
                }`}
              >
                {section.title.replace(/^\d+\)\s*/, "")}
              </a>
              <Link
                href={resolvePrepSectionHref(section.id)}
                className="mt-0.5 block px-2 text-[9px] font-bold uppercase text-kelly-navy hover:underline"
              >
                Full drill-down →
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.id} id={`v4-prep-${section.id}`} className="scroll-mt-24 rounded-xl border border-kelly-text/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{section.title}</h2>
                <Link
                  href={resolvePrepSectionHref(section.id)}
                  className="rounded-lg bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-kelly-navy/90"
                >
                  Open full drill-down
                </Link>
              </div>
              {getPrepSectionGuide(section.id) ? (
                <V4OperatorGuide guide={getPrepSectionGuide(section.id)!} compact />
              ) : null}
              <p className="mt-2 text-[10px] font-bold uppercase text-kelly-subtle">Research content below</p>
              {section.paragraphs.length > 0 ? (
                <div className="mt-2 space-y-2 text-xs leading-relaxed text-kelly-muted">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              ) : null}
              {section.bullets.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 64)}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
