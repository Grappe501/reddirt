"use client";

import { useState } from "react";
import { EVIDENCE_AI_TOOL_CATALOG } from "@/lib/campaign-media/evidence-ai-tool-defs";
import { listEvidenceAiModesForUi } from "@/lib/campaign-media/evidence-ai-modes";
import { strategicPlacementNotes } from "@/content/media/strategic-photo-placements";

/**
 * Round A chrome — placement notes + AI catalog collapsed by default.
 * Keeps first viewport on Tooling → Command → Next Actions → tabs.
 */
export function EvidenceCollapsedChrome() {
  const [showPlacement, setShowPlacement] = useState(false);
  const [showTools, setShowTools] = useState(false);

  return (
    <div className="mt-4 space-y-2">
      <div className="rounded-lg border border-[#000066]/15 bg-white">
        <button
          type="button"
          onClick={() => setShowPlacement((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-body text-xs font-bold uppercase tracking-wide text-[#000066]"
        >
          <span>Where photos go on the site</span>
          <span className="font-normal normal-case text-[#364272]">
            {showPlacement ? "Hide" : "Show"}
          </span>
        </button>
        {showPlacement ? (
          <ul className="border-t border-[#8eb6dc]/30 px-3 py-2 list-disc space-y-1 pl-8 font-body text-sm text-[#364272]">
            {strategicPlacementNotes().map((n) => (
              <li key={n.surface}>
                <span className="font-semibold text-[#12124a]">{n.surface}:</span> {n.how}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-lg border border-[#000066]/15 bg-white">
        <button
          type="button"
          onClick={() => setShowTools((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-body text-xs font-bold uppercase tracking-wide text-[#000066]"
        >
          <span>OpenAI evidence brain · tool catalog</span>
          <span className="font-normal normal-case text-[#364272]">
            {showTools ? "Hide tools" : `Show tools (${EVIDENCE_AI_TOOL_CATALOG.length})`}
          </span>
        </button>
        {showTools ? (
          <div className="space-y-3 border-t border-[#8eb6dc]/30 px-3 py-3">
            <p className="font-body text-sm text-[#364272]">
              Mode-routed Suggest (Identify · Fit · Prep · Publish · Command · General). Prefer
              Unknown — never auto-confirm geography.
            </p>
            <ul className="flex flex-wrap gap-2">
              {(["photo", "video"] as const).flatMap((kind) =>
                listEvidenceAiModesForUi(kind).map((m) => (
                  <li
                    key={`${kind}-${m.id}`}
                    className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-2 py-1 font-body text-[11px] text-[#12124a]"
                  >
                    <span className="font-semibold">
                      {kind}/{m.label}
                    </span>
                    {" · "}
                    {m.toolCount === "all" ? "all tools" : `${m.toolCount} tools`}
                  </li>
                )),
              )}
            </ul>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {EVIDENCE_AI_TOOL_CATALOG.map((t) => (
                <li
                  key={t.name}
                  className="rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1.5"
                >
                  <p className="font-mono text-[11px] font-bold text-[#000066]">{t.name}</p>
                  <p className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-[#364272]">
                    {t.audience}
                  </p>
                  <p className="mt-1 font-body text-xs leading-relaxed text-[#12124a]">{t.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
