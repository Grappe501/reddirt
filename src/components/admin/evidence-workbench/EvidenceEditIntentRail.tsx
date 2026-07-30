import Link from "next/link";
import {
  EVIDENCE_EDIT_INTENTS,
  EVIDENCE_EDIT_SITE_SURFACES,
  evidenceEditHref,
  photoEditLanePreset,
  type EvidenceEditIntent,
  type EvidenceEditSiteSurface,
} from "@/lib/campaign-media/evidence-edit-intents";
import { cn } from "@/lib/utils";

type Props = {
  focusId?: string;
  intent: EvidenceEditIntent | null;
  surface: EvidenceEditSiteSurface | null;
};

const INTENT_LABELS: Record<EvidenceEditIntent, string> = {
  social: "Social / download",
  header: "Super header",
  site: "Site surfaces",
};

const SURFACE_LABELS: Record<EvidenceEditSiteSurface, string> = {
  homepage: "Homepage",
  meetKelly: "Meet Kelly",
  other: "Other page",
};

/** Phase 3 intent rail — Social · Header · Site (+ site sub-lanes). */
export function EvidenceEditIntentRail({ focusId, intent, surface }: Props) {
  const preset = photoEditLanePreset(intent, surface);

  return (
    <div className="mb-4 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-3 text-[#12124a]">
      <p className="font-heading text-xs font-bold uppercase text-[#000066]">
        Creative Edit · Board B · intent lanes
      </p>
      <p className="mt-1 font-body text-xs text-[#364272]">
        {preset.hint} Prefer Unknown. Never silent Promote. Social = download pack only (no auto-post).
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {EVIDENCE_EDIT_INTENTS.map((id) => (
          <Link
            key={id}
            href={evidenceEditHref({
              id: focusId,
              intent: id,
              surface: id === "site" ? surface ?? "homepage" : null,
            })}
            className={cn(
              "rounded-md border-2 px-3 py-1.5 font-body text-xs font-bold",
              intent === id
                ? "border-[#000066] bg-[#000066] text-white"
                : "border-[#8eb6dc] bg-white text-[#12124a]",
            )}
          >
            {INTENT_LABELS[id]}
          </Link>
        ))}
        <Link
          href="/admin/evidence-workbench?tab=publish"
          className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
        >
          Publish desk →
        </Link>
        <Link
          href="/admin/evidence-workbench?tab=identify&filter=unknown"
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
        >
          ← Identify
        </Link>
      </div>
      {intent === "site" ? (
        <div className="mt-2 flex flex-wrap gap-2 border-t border-[#ca913d]/30 pt-2">
          <span className="self-center font-body text-[10px] font-bold uppercase text-[#000066]">
            Site lane
          </span>
          {EVIDENCE_EDIT_SITE_SURFACES.map((s) => (
            <Link
              key={s}
              href={evidenceEditHref({ id: focusId, intent: "site", surface: s })}
              className={cn(
                "rounded-md border px-2.5 py-1 font-body text-[11px] font-bold",
                surface === s || (!surface && s === "homepage")
                  ? "border-[#000066] bg-[#000066] text-white"
                  : "border-[#8eb6dc] bg-white text-[#12124a]",
              )}
            >
              {SURFACE_LABELS[s]}
            </Link>
          ))}
        </div>
      ) : null}
      {intent ? (
        <p className="mt-2 font-body text-[10px] text-[#364272]">
          Active · <span className="font-semibold text-[#000066]">{preset.label}</span> · look{" "}
          {preset.look} · slots {preset.slots.join(", ")} · deliver{" "}
          {preset.deliver === "download" ? "download pack" : "promote → Publish"}
        </p>
      ) : (
        <p className="mt-2 font-body text-[10px] text-[#364272]">
          Pick a lane to load Pro Edit slot presets.
        </p>
      )}
    </div>
  );
}
