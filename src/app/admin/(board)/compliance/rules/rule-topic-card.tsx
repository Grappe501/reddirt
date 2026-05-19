"use client";

import { useTransition } from "react";
import type { ComplianceRuleChunk, ComplianceRuleSource, ComplianceRuleTopicCoverage } from "@/lib/compliance/knowledge/compliance-rule-types";
import { markRuleSourceReviewedAction, markRuleTopicReviewedAction } from "../actions";

type Props = {
  topic: ComplianceRuleTopicCoverage;
  sources: ComplianceRuleSource[];
  chunks: ComplianceRuleChunk[];
  topicReviewed?: { initials: string; at: string; note?: string };
};

export function RuleTopicCard({ topic, sources, chunks, topicReviewed }: Props) {
  const [pending, start] = useTransition();
  const tone =
    topic.status === "verified_authoritative"
      ? "border-emerald-300 bg-emerald-50"
      : topic.status === "missing" || topic.status === "broken_link"
        ? "border-red-300 bg-red-50"
        : "border-amber-300 bg-amber-50";

  return (
    <article id={`topic-${topic.topic}`} className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-heading text-lg font-bold text-[#0f2744]">{topic.label}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold uppercase">{topic.status.replace(/_/g, " ")}</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">{topic.nextAction}</p>
      <dl className="mt-3 grid gap-1 text-xs text-slate-600">
        <div className="flex justify-between">
          <dt>Sources</dt>
          <dd>{topic.sourceCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Chunks</dt>
          <dd>{topic.chunkCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Official source</dt>
          <dd>{topic.hasOfficialSource ? "yes" : "no"}</dd>
        </div>
        {topic.brokenLinkCount ? (
          <div className="flex justify-between text-red-800">
            <dt>Broken links</dt>
            <dd>{topic.brokenLinkCount}</dd>
          </div>
        ) : null}
      </dl>
      {sources.length ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-bold uppercase text-slate-500">Sources</p>
          {sources.map((source) => (
            <div className="rounded-lg border border-white/80 bg-white/70 p-2 text-xs" key={source.id}>
              <p className="font-semibold">{source.title}</p>
              <p>Status: {source.verificationStatus}</p>
              {source.url ? (
                <a className="break-all text-[#0f2744] underline" href={source.url} target="_blank" rel="noreferrer">
                  {source.url}
                </a>
              ) : null}
              {source.verificationStatus === "manual_needed" ? (
                <p className="mt-1 text-amber-900">Manual download required — save to data/compliance/knowledge/raw/ and rebuild corpus.</p>
              ) : null}
              {source.reviewedByInitials ? (
                <p className="mt-1 font-semibold text-emerald-900">Reviewed by compliance officer ({source.reviewedByInitials})</p>
              ) : null}
              <button
                type="button"
                disabled={pending}
                className="mt-2 rounded-full border border-[#0f2744] px-3 py-1 text-[11px] font-semibold"
                onClick={() => {
                  const initials = window.prompt("Officer initials:");
                  if (!initials?.trim()) return;
                  const note = window.prompt("Review note (optional):") ?? undefined;
                  start(() => markRuleSourceReviewedAction({ sourceId: source.id, initials, note }));
                }}
              >
                Mark source reviewed
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {chunks.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-bold uppercase text-slate-500">Citations / chunks ({chunks.length})</summary>
          <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-xs">
            {chunks.slice(0, 8).map((chunk) => (
              <li key={chunk.id} className="rounded bg-white/70 p-2">
                <p className="font-semibold">{chunk.title}</p>
                <p className="line-clamp-3 text-slate-600">{chunk.text}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {topicReviewed ? (
        <p className="mt-3 text-sm font-semibold text-emerald-900">
          Topic reviewed by compliance officer ({topicReviewed.initials}) — source verified for campaign use, not legal certification.
        </p>
      ) : (
        <button
          type="button"
          disabled={pending}
          className="mt-3 w-full rounded-full bg-[#0f2744] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          onClick={() => {
            const initials = window.prompt("Compliance officer initials:");
            if (!initials?.trim()) return;
            const note = window.prompt("Review note (optional):") ?? undefined;
            start(() => markRuleTopicReviewedAction({ topic: topic.topic, initials, note }));
          }}
        >
          Mark topic reviewed
        </button>
      )}
    </article>
  );
}
