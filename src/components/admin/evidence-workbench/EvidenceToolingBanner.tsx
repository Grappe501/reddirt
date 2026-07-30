"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getEvidenceToolingReadinessAction } from "@/app/admin/evidence-workbench-actions";
import type { EvidenceToolingReadiness } from "@/lib/campaign-media/evidence-tooling-readiness";

type Props = {
  initial: EvidenceToolingReadiness;
};

/** Sticky OpenAI + ffmpeg readiness — makes silent tooling failures visible. */
export function EvidenceToolingBanner({ initial }: Props) {
  const [readiness, setReadiness] = useState(initial);
  const [pending, start] = useTransition();

  useEffect(() => {
    setReadiness(initial);
  }, [initial]);

  function refresh() {
    start(async () => {
      const res = await getEvidenceToolingReadinessAction();
      if (res.readiness) setReadiness(res.readiness);
    });
  }

  const tone = readiness.ok ? "ok" : "warn";

  return (
    <div className={`ew-banner ew-banner-${tone} mt-5`} role="status">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-navy">
            Tooling readiness · {readiness.ok ? "Ready" : "Blocked"}
          </p>
          <ul className="mt-2 space-y-1 font-body text-sm text-kelly-text">
            <li>
              OpenAI:{" "}
              <span className="font-semibold">
                {readiness.openaiConfigured ? "configured" : "missing OPENAI_API_KEY"}
              </span>
            </li>
            <li>
              ffmpeg:{" "}
              <span className="font-semibold">
                {readiness.ffmpeg.ffmpegAvailable
                  ? `available (${readiness.ffmpeg.source})`
                  : "missing"}
              </span>
              {readiness.ffmpeg.ffmpegVersion ? ` · ${readiness.ffmpeg.ffmpegVersion}` : ""}
            </li>
          </ul>
          {readiness.blockers.length ? (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 font-body text-xs text-kelly-slate">
              {readiness.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
          {readiness.warnings.length ? (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 font-body text-xs text-kelly-slate">
              {readiness.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
          {!readiness.ffmpeg.ffmpegAvailable ? (
            <p className="mt-2 font-mono text-[11px] text-kelly-slate">{readiness.ffmpeg.installHint}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={refresh}
            className="rounded-md border-2 border-kelly-navy bg-white px-3 py-1.5 font-body text-xs font-bold text-kelly-navy disabled:opacity-50"
          >
            Re-probe
          </button>
          <Link
            href="/admin/evidence-workbench?tab=speeches"
            className="rounded-md border-2 border-kelly-navy/20 bg-kelly-fog px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy"
          >
            Videos tab
          </Link>
        </div>
      </div>
    </div>
  );
}
