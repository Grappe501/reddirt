"use client";

import Link from "next/link";

import {
  EXTENDED_RESPONSE_CATEGORIES,
  getExtendedResponse,
  type ExtendedResponseNarrative,
} from "@/lib/election-plan/debate-prep-extended-responses-v9";
import { epDebatePrepExtendedResponseHref } from "@/lib/election-plan/debate-prep-links";

function ResponseCard({ narrative }: { narrative: ExtendedResponseNarrative }) {
  return (
    <Link
      href={epDebatePrepExtendedResponseHref(narrative.id)}
      className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{narrative.moduleSource}</p>
      <p className="mt-1 font-heading text-base font-bold text-slate-900">{narrative.title}</p>
      <p className="mt-2 text-sm text-slate-600">{narrative.trigger}</p>
      <p className="mt-3 line-clamp-2 text-sm text-slate-700">{narrative.answer90s}</p>
    </Link>
  );
}

export function ElectionPlanExtendedResponsesIndexPanel({
  narratives,
}: {
  narratives: readonly ExtendedResponseNarrative[];
}) {
  return (
    <div className="space-y-10">
      {EXTENDED_RESPONSE_CATEGORIES.map((cat) => {
        const items = narratives.filter((n) => n.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id}>
            <h2 className="font-heading text-lg font-bold text-slate-900">{cat.label}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((n) => (
                <ResponseCard key={n.id} narrative={n} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function ElectionPlanExtendedResponseDetailPanel({ responseId }: { responseId: string }) {
  const narrative = getExtendedResponse(responseId);
  if (!narrative) {
    return <p className="text-sm text-slate-600">Response not found.</p>;
  }

  const lengths = [
    { key: "30s", label: "30-second pivot", body: narrative.answer30s },
    { key: "90s", label: "90-second moderator answer", body: narrative.answer90s },
    { key: "180s", label: "Extended narrative", body: narrative.answer180s },
  ] as const;

  return (
    <article className="space-y-6">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{narrative.moduleSource}</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900">{narrative.title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-700">When you hear: {narrative.trigger}</p>
      </header>

      {lengths.map((block) => (
        <section key={block.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{block.label}</p>
          <p className="mt-3 leading-relaxed text-slate-800">{block.body}</p>
        </section>
      ))}

      <section className="rounded-xl border border-violet-200 bg-violet-50/50 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-900">Voter translation</p>
        <p className="mt-2 text-sm text-violet-950">{narrative.voterTranslation}</p>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Claims gate</p>
        <p className="mt-2 text-sm text-amber-950">{narrative.claimsNote}</p>
      </section>

      {narrative.relatedHref ? (
        <Link href={narrative.relatedHref} className="inline-block text-sm font-bold text-slate-900 underline">
          {narrative.relatedLabel ?? "Deep study"} →
        </Link>
      ) : null}
    </article>
  );
}
