"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DEBATE_GLOSSARY_CATEGORIES,
  DEBATE_GLOSSARY_TERMS,
  type DebateGlossaryCategory,
} from "@/lib/intelligence/v4/debateGlossaryRegistry";

const CATEGORY_COLORS: Record<DebateGlossaryCategory, string> = {
  governance: "border-rose-300 bg-rose-50/60 text-rose-950",
  "debate-craft": "border-violet-300 bg-violet-50/60 text-violet-950",
  organization: "border-emerald-300 bg-emerald-50/60 text-emerald-950",
  "election-ops": "border-sky-300 bg-sky-50/60 text-sky-950",
  opposition: "border-amber-300 bg-amber-50/60 text-amber-950",
  "candidate-ux": "border-indigo-300 bg-indigo-50/60 text-indigo-950",
};

export function DebateGlossaryIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DebateGlossaryCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return DEBATE_GLOSSARY_TERMS.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.label.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [query, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search terms…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-kelly-navy/20 px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DebateGlossaryCategory | "all")}
          className="rounded-lg border border-kelly-navy/20 px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {DEBATE_GLOSSARY_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-kelly-muted">
        {filtered.length} of {DEBATE_GLOSSARY_TERMS.length} terms · Wikipedia-style definitions for intelligence
        workbench jargon
      </p>

      <dl className="grid gap-4 md:grid-cols-2">
        {filtered.map((term) => {
          const catLabel = DEBATE_GLOSSARY_CATEGORIES.find((c) => c.id === term.category)?.label ?? term.category;
          return (
            <div
              key={term.id}
              id={term.id}
              className="scroll-mt-24 rounded-xl border border-kelly-navy/10 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <dt className="font-heading text-base font-bold text-kelly-navy">{term.label}</dt>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${CATEGORY_COLORS[term.category]}`}
                >
                  {catLabel}
                </span>
              </div>
              <dd className="mt-2 text-sm leading-relaxed text-kelly-text">{term.definition}</dd>
              <div className="mt-3 flex flex-wrap gap-2">
                {term.fieldBookSlug ? (
                  <Link
                    href={`/admin/intelligence/field-book/${term.fieldBookSlug}`}
                    className="rounded-full border border-kelly-gold/50 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
                  >
                    Field Book →
                  </Link>
                ) : null}
                {term.intelligenceHref ? (
                  <Link
                    href={term.intelligenceHref}
                    className="rounded-full border border-kelly-navy/20 px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
                  >
                    Workbench →
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
