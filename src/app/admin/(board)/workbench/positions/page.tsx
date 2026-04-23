import Link from "next/link";
import { POSITION_TREE } from "@/lib/campaign-engine/positions";
import { getPositionInboxConfigOrNull } from "@/lib/campaign-engine/position-inbox";

export default function PositionWorkbenchesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <Link href="/admin/workbench" className="text-sm text-civic-slate hover:underline">
          ← Workbench
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-deep-soil">Position workbenches (WB-CORE-1)</h1>
        <p className="mt-2 text-sm text-deep-soil/75">
          Read-only views by role. Inbox heuristics exist only for selected positions; others show org context and links
          only.{" "}
          <Link href="/admin/workbench/seats" className="font-semibold text-civic-slate hover:underline">
            Position seats (SEAT-1)
          </Link>
        </p>
      </div>
      <ul className="space-y-2">
        {POSITION_TREE.map((n) => {
          const cfg = getPositionInboxConfigOrNull(n.id);
          const badge = cfg
            ? cfg.supportLevel === "full"
              ? "Inbox: full (heuristic)"
              : `Inbox: ${cfg.supportLevel}`
            : "Inbox: destinations only";
          return (
            <li key={n.id}>
              <Link
                href={`/admin/workbench/positions/${n.id}`}
                className="block rounded-lg border border-deep-soil/10 bg-cream-canvas px-4 py-3 shadow-sm transition hover:border-deep-soil/25"
              >
                <p className="font-medium text-civic-slate">{n.displayName}</p>
                <p className="text-[10px] text-deep-soil/50">
                  {n.id} · {badge}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
