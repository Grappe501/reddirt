"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SocialContentKind } from "@prisma/client";
import { createSocialContentItemAction } from "@/app/admin/workbench-social-actions";

const KIND_OPTIONS: { v: SocialContentKind; label: string }[] = [
  { v: SocialContentKind.EVENT_PROMO, label: "Event promo" },
  { v: SocialContentKind.RAPID_RESPONSE, label: "Rapid response" },
  { v: SocialContentKind.POST_EVENT_RECAP, label: "Post-event recap" },
  { v: SocialContentKind.CLIP_REPURPOSE, label: "Clip / repurpose" },
  { v: SocialContentKind.ORGANIC, label: "Organic" },
  { v: SocialContentKind.OTHER, label: "Other" },
];

export function CreateSocialItemForm() {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="grid max-w-md gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await createSocialContentItemAction(fd);
          if (!r.ok) {
            setErr(r.error);
            return;
          }
          e.currentTarget.reset();
          router.refresh();
        });
      }}
    >
      {err ? <p className="text-xs text-red-800">{err}</p> : null}
      <label className="text-[10px] font-bold uppercase text-deep-soil/45">Title</label>
      <input
        name="title"
        required
        maxLength={200}
        className="border border-deep-soil/15 bg-white px-1.5 py-0.5 font-body text-sm"
        placeholder="e.g. Host rally recap — NWA"
        autoComplete="off"
      />
      <label className="text-[10px] font-bold uppercase text-deep-soil/45">Kind</label>
      <select name="kind" className="border border-deep-soil/15 bg-white px-1 py-0.5 text-sm" defaultValue={SocialContentKind.OTHER}>
        {KIND_OPTIONS.map((k) => (
          <option key={k.v} value={k.v}>
            {k.label}
          </option>
        ))}
      </select>
      <label className="text-[10px] font-bold uppercase text-deep-soil/45">Default copy (optional)</label>
      <textarea
        name="bodyCopy"
        rows={3}
        maxLength={50000}
        className="border border-deep-soil/15 bg-white p-1 font-mono text-xs"
        placeholder="Master draft; per-platform in variants later."
      />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded border border-deep-soil/20 bg-deep-soil px-2 py-1 font-body text-sm font-bold text-cream-canvas disabled:opacity-50"
      >
        {pending ? "Saving…" : "Create work item"}
      </button>
    </form>
  );
}
