"use client";

import { useState, useTransition } from "react";
import { previewBroadcastAudienceAction } from "@/app/admin/broadcast-comms-actions";

type Props = {
  defaultChannel: string;
  defaultJson: string;
};

export function BroadcastAudiencePreview(p: Props) {
  const [out, setOut] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-1 space-y-0.5">
      <button
        type="button"
        disabled={pending}
        className="rounded border border-washed-denim/30 bg-white px-1.5 py-0.5 text-[9px] font-bold text-civic-slate"
        onClick={() => {
          const fd = new FormData();
          const el = document.querySelector<HTMLTextAreaElement>("#broadcast-audience-json");
          const ch = document.querySelector<HTMLSelectElement>("#broadcast-channel");
          fd.set("audienceJson", el?.value ?? p.defaultJson);
          fd.set("channel", ch?.value ?? p.defaultChannel);
          start(async () => {
            const r = await previewBroadcastAudienceAction(fd);
            if (r.ok) {
              setOut(
                `Audience: ${r.total} (after dedupe) · Suppressed: ${r.suppressed}. Sample: ${r.sample
                  .map((x) => `${x.channel} ${x.suppressed ? "[skip]" : ""} ${x.email || x.phone || "—"}`)
                  .join("; ")}`
              );
            } else {
              setOut("Preview failed.");
            }
          });
        }}
      >
        {pending ? "…" : "Preview audience"}
      </button>
      {out ? <p className="text-[9px] text-deep-soil/70">{out}</p> : null}
    </div>
  );
}

