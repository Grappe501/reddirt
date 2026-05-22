import Link from "next/link";
import { loadMemoryReviewQueue } from "@/lib/agents/runtime/memory-review-store";
import { loadRuntimeAudit } from "@/lib/agents/runtime/runtime-audit";
import { MemoryReviewQueueClient } from "@/components/agents/MemoryReviewQueueClient";

export const dynamic = "force-dynamic";

export default function MemoryReviewPage() {
  const queue = loadMemoryReviewQueue();
  const audit = loadRuntimeAudit().slice(-10);

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6 pb-16 font-body">
      <header>
        <Link href="/admin/ai-command-center" className="text-xs font-bold text-kelly-navy underline">
          ← AI command center
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">Memory review queue</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Human reviews memory candidates before durable agent knowledge. JSON only — no vector DB in V1.
        </p>
      </header>
      <MemoryReviewQueueClient initialQueue={JSON.parse(JSON.stringify(queue))} />
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 text-xs">
        <h2 className="font-bold">Recent runtime audits</h2>
        {audit.length === 0 ? (
          <p className="mt-2 text-kelly-subtle">No audits yet — use Ask the Campaign Agent on any tracked page.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {audit.map((a) => (
              <li key={a.id} className="rounded border px-2 py-1">
                {a.at.slice(0, 19)} · {a.intentTask} · {a.message.slice(0, 60)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
