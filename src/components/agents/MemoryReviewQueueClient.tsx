"use client";

import { useState, useTransition } from "react";
import { reviewMemoryCandidateAction } from "@/app/admin/agent-runtime/actions";
import type { MemoryReviewRecord } from "@/lib/agents/runtime/memory-review-store";

export function MemoryReviewQueueClient({ initialQueue }: { initialQueue: MemoryReviewRecord[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [pending, startTransition] = useTransition();

  const act = (id: string, status: "approved" | "rejected" | "hold", note?: string) => {
    startTransition(async () => {
      const res = await reviewMemoryCandidateAction(id, status, note);
      if (res.ok) {
        setQueue((q) =>
          q.map((item) =>
            item.id === id ? { ...item, status, updatedAt: new Date().toISOString(), reviewedBy: "admin" } : item,
          ),
        );
      }
    });
  };

  if (!queue.length) {
    return <p className="text-sm text-kelly-text/55">No memory candidates pending. Use the agent palette to generate plans.</p>;
  }

  return (
    <ul className="space-y-3 text-sm">
      {queue.map((item) => (
        <li key={item.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{item.memoryType}</span>
            <span className="rounded-full border px-2 py-0.5 text-[10px]">{item.status}</span>
            <span className="text-[10px] text-kelly-text/50">risk {item.riskLevel}</span>
          </div>
          <p className="mt-2 text-xs text-kelly-text/70">{item.reason}</p>
          <p className="mt-1 text-[10px] text-kelly-text/45">→ {item.suggestedStorageTarget}</p>
          <p className="mt-1 text-[10px] text-kelly-text/45">Created {item.createdAt.slice(0, 19)}</p>
          {item.status === "pending" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white"
                onClick={() => act(item.id, "approved")}
              >
                Approve
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-full border px-3 py-1 text-xs font-bold"
                onClick={() => act(item.id, "hold")}
              >
                Hold
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-full border border-red-300 px-3 py-1 text-xs font-bold text-red-900"
                onClick={() => act(item.id, "rejected")}
              >
                Reject
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
