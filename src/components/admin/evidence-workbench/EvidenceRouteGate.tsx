"use client";

import Link from "next/link";

export type EvidenceRouteIntent =
  | "county"
  | "social"
  | "header"
  | "site"
  | "speaks"
  | "hold";

type Props = {
  assetId: string;
  kind?: "photo" | "speech";
  open: boolean;
  /** Phase 2 — navigation is locked until Route or Hold. */
  locked?: boolean;
  onDismiss: () => void;
};

type Choice = {
  intent: EvidenceRouteIntent;
  label: string;
  hint: string;
  href: (id: string) => string;
};

const PHOTO_CHOICES: Choice[] = [
  {
    intent: "county",
    label: "County album now",
    hint: "Identity locked → approve into county folder. No creative edit.",
    href: (id) => `/admin/evidence-workbench?tab=county&id=${encodeURIComponent(id)}`,
  },
  {
    intent: "social",
    label: "Social / download",
    hint: "Crop + Pro Edit → download pack (no auto-post).",
    href: (id) =>
      `/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(id)}&intent=social`,
  },
  {
    intent: "header",
    label: "Super header / hero",
    hint: "Wide header lane on Creative Edit.",
    href: (id) =>
      `/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(id)}&intent=header`,
  },
  {
    intent: "site",
    label: "Homepage / Meet Kelly / other page",
    hint: "Edit then Publish surfaces.",
    href: (id) =>
      `/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(id)}&intent=site`,
  },
];

const SPEECH_CHOICES: Choice[] = [
  {
    intent: "county",
    label: "County / Speaks confirm",
    hint: "Counties locked → finish approve/publish on County desk.",
    href: (id) => `/admin/evidence-workbench?tab=county&id=${encodeURIComponent(id)}`,
  },
  {
    intent: "speaks",
    label: "Kelly Speaks / homepage video",
    hint: "Place on Publish desk (confirmCurate).",
    href: (id) => `/admin/evidence-workbench?tab=publish&id=${encodeURIComponent(id)}`,
  },
  {
    intent: "social",
    label: "Cuts / social download",
    hint: "Quote → encode / Pro Edit on Edit desk.",
    href: (id) =>
      `/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(id)}&intent=social`,
  },
  {
    intent: "site",
    label: "Homepage primary / Across AR",
    hint: "Edit cuts if needed, then Publish placement.",
    href: (id) =>
      `/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(id)}&intent=site`,
  },
];

/**
 * Phase 2 Route gate — after Identify Save, choose path. Prefer Unknown / Hold stays on Board A.
 * When locked, Prev/Next/filter stay blocked until Route link or Hold.
 */
export function EvidenceRouteGate({
  assetId,
  kind = "photo",
  open,
  locked = false,
  onDismiss,
}: Props) {
  if (!open || !assetId) return null;
  const choices = kind === "speech" ? SPEECH_CHOICES : PHOTO_CHOICES;

  return (
    <div
      className="rounded-lg border-2 border-[#ca913d] bg-[#fff8ef] p-4 text-[#12124a]"
      role="dialog"
      aria-labelledby="ew-route-gate-title"
    >
      <p
        id="ew-route-gate-title"
        className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]"
      >
        Route this {kind}
        {locked ? " · locked" : ""}
      </p>
      <p className="mt-1 font-body text-xs text-[#364272]">
        Identity saved for <span className="font-mono font-semibold">{assetId}</span>. Choose how it
        proceeds before leaving this asset.
        {locked
          ? " Prev / Next / queue filters are blocked until you Route or Hold."
          : " Prefer Unknown means Hold and stay on Identify."}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {choices.map((c) => (
          <Link
            key={c.intent}
            href={c.href(assetId)}
            className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 text-left transition hover:bg-[#f4f7fc]"
          >
            <span className="block font-body text-xs font-bold text-[#000066]">{c.label}</span>
            <span className="mt-0.5 block font-body text-[10px] text-[#364272]">{c.hint}</span>
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
      >
        Hold / Prefer Unknown — stay on Identify
      </button>
    </div>
  );
}
