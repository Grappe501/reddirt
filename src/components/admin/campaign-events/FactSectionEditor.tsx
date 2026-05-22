"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveCampaignEventFactSectionAction } from "@/app/admin/(board)/campaign-events/actions";
import type { EditableFactSectionId } from "@/lib/campaign-events/constants";
import { SECTION_FIELD_CONFIG } from "@/lib/campaign-events/section-field-config";
import type { CampaignEventFactCardData } from "@/lib/campaign-events/fact-card-data";

export function FactSectionEditor({
  recordId,
  sectionId,
  factCard,
  onCancel,
  onSaved,
}: {
  recordId: string;
  sectionId: EditableFactSectionId;
  factCard: CampaignEventFactCardData;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const data = factCard[sectionId] as Record<string, string | undefined>;
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const cfg of SECTION_FIELD_CONFIG[sectionId]) {
      initial[cfg.key] = data[cfg.key] ?? "";
    }
    return initial;
  });
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mt-3 grid gap-3 rounded-xl border border-kelly-navy/20 bg-kelly-wash p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        startTransition(async () => {
          try {
            await saveCampaignEventFactSectionAction(recordId, sectionId, values);
            setMessage("Saved.");
            router.refresh();
            onSaved();
          } catch (err) {
            setMessage(err instanceof Error ? err.message : "Save failed.");
          }
        });
      }}
    >
      {SECTION_FIELD_CONFIG[sectionId].map((cfg) => (
        <label key={cfg.key} className="grid gap-1 font-body text-sm">
          <span className="text-xs font-semibold text-kelly-muted">{cfg.label}</span>
          {cfg.inputType === "select" && cfg.options ? (
            <select
              className="rounded-lg border border-kelly-text/15 bg-kelly-page px-3 py-2"
              value={values[cfg.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [cfg.key]: e.target.value }))}
            >
              {cfg.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="rounded-lg border border-kelly-text/15 bg-kelly-page px-3 py-2"
              value={values[cfg.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [cfg.key]: e.target.value }))}
            />
          )}
          {cfg.helper ? <span className="text-xs text-kelly-subtle">{cfg.helper}</span> : null}
        </label>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-kelly-navy px-4 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save section"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-kelly-text/15 px-4 py-2 font-body text-xs font-bold text-kelly-muted"
        >
          Cancel
        </button>
      </div>
      {message ? <p className="font-body text-xs text-kelly-navy">{message}</p> : null}
    </form>
  );
}
