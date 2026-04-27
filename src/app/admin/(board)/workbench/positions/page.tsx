import Link from "next/link";
import { POSITION_TREE } from "@/lib/campaign-engine/positions";
import { getPositionInboxConfigOrNull } from "@/lib/campaign-engine/position-inbox";

export default function PositionWorkbenchesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <Link href="/admin/workbench" className="text-sm text-kelly-slate hover:underline">
          ← Workbench
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Position workbenches (WB-CORE-1)</h1>
        <p className="mt-2 text-sm text-kelly-text/75">
          Read-only views by role. Inbox heuristics exist only for selected positions; others show org context and links
          only.{" "}
          <Link href="/admin/workbench/seats" className="font-semibold text-kelly-slate hover:underline">
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
                className="block rounded-lg border border-kelly-text/10 bg-kelly-page px-4 py-3 shadow-sm transition hover:border-kelly-text/25"
              >
                <p className="font-medium text-kelly-slate">{n.displayName}</p>
                <p className="text-[10px] text-kelly-text/50">
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
