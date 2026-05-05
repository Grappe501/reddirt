"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runEmailWorkflowAiAnalysisAction } from "@/app/admin/email-ai-actions";

export function RunEmailWorkflowAiAnalysisButton({ itemId }: { itemId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        setNotice(null);
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await runEmailWorkflowAiAnalysisAction(fd);
          if (!r.ok) {
            const missingKey =
              r.error.toLowerCase().includes("not configured") ||
              r.error.includes("OPENAI_API_KEY missing");
            if (missingKey) {
              setNotice("OpenAI Email Intelligence is not configured (OPENAI_API_KEY). See readiness above.");
              router.refresh();
              return;
            }
            setErr(r.error);
            router.refresh();
            return;
          }
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="itemId" value={itemId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded border-2 border-kelly-forest/45 bg-kelly-forest/90 px-3 py-1 text-[11px] font-bold text-white disabled:opacity-60"
      >
        {pending ? "Running AI analysis…" : "Run AI email analysis"}
      </button>
      {notice ? (
        <p className="mt-2 text-[11px] text-amber-950/90">{notice}</p>
      ) : null}
      {err ? <p className="mt-2 text-[11px] text-rose-900">{err}</p> : null}
    </form>
  );
}
