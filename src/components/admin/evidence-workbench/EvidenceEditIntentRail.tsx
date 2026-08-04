import Link from "next/link";
import {
  EVIDENCE_EDIT_INTENTS,
  EVIDENCE_FINISH_SURFACES,
  evidenceEditHref,
  finishSurfaceFromEdit,
  photoEditLanePreset,
  type EvidenceEditIntent,
  type EvidenceEditSiteSurface,
  type EvidenceFinishSurface,
} from "@/lib/campaign-media/evidence-edit-intents";
import { cn } from "@/lib/utils";

type Props = {
  focusId?: string;
  intent: EvidenceEditIntent | null;
  surface: EvidenceEditSiteSurface | null;
};

const FINISH_LABELS: Record<EvidenceFinishSurface, string> = {
  homepage: "Homepage",
  journey: "Journey",
  album: "Album",
  social: "Social",
};

const INTENT_LABELS: Record<EvidenceEditIntent, string> = {
  social: "Social / download",
  header: "Super header",
  site: "Site (advanced)",
};

/** P1 intent rail — place surfaces first, legacy intent lanes secondary. */
export function EvidenceEditIntentRail({ focusId, intent, surface }: Props) {
  const finish = finishSurfaceFromEdit(intent, surface);
  const preset = photoEditLanePreset(intent, surface);

  return (
    <div className="mb-4 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-3 text-[#12124a]">
      <p className="font-heading text-xs font-bold uppercase text-[#000066]">
        Creative Edit · place surface
      </p>
      <p className="mt-1 font-body text-xs text-[#364272]">
        Pick Homepage / Journey / Album / Social, then Finish for web. Prefer Unknown. Never silent
        Promote. Social = download pack only.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {EVIDENCE_FINISH_SURFACES.map((id) => (
          <Link
            key={id}
            href={evidenceEditHref({
              id: focusId,
              finishSurface: id,
            })}
            className={cn(
              "rounded-md border-2 px-3 py-1.5 font-body text-xs font-bold",
              finish === id
                ? "border-[#000066] bg-[#000066] text-white"
                : "border-[#8eb6dc] bg-white text-[#12124a]",
            )}
          >
            {FINISH_LABELS[id]}
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
      <details className="mt-2 border-t border-[#ca913d]/30 pt-2">
        <summary className="cursor-pointer font-body text-[10px] font-bold uppercase text-[#000066]">
          Advanced intent lanes
        </summary>
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
                "rounded-md border px-2.5 py-1 font-body text-[11px] font-bold",
                intent === id
                  ? "border-[#000066] bg-[#000066] text-white"
                  : "border-[#8eb6dc] bg-white text-[#12124a]",
              )}
            >
              {INTENT_LABELS[id]}
            </Link>
          ))}
        </div>
      </details>
      {intent ? (
        <p className="mt-2 font-body text-[10px] text-[#364272]">
          Active · <span className="font-semibold text-[#000066]">{preset.label}</span> · look{" "}
          {preset.look} · slots {preset.slots.join(", ")} · deliver{" "}
          {preset.deliver === "download" ? "download pack" : "Finish → ship + curate proposal"}
        </p>
      ) : null}
    </div>
  );
}
