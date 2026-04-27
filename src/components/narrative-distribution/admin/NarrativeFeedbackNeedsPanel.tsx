import type { FeedbackNeedDemo } from "@/lib/narrative-distribution/demo-admin-command-center";
import { getDemoNarrativePacketById } from "@/lib/narrative-distribution/assets";

type Props = { items: FeedbackNeedDemo[] };

function formatDue(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function NarrativeFeedbackNeedsPanel({ items }: Props) {
  return (
    <ul className="space-y-3">
      {items.map((f) => {
        const packet = f.linkedPacketId ? getDemoNarrativePacketById(f.linkedPacketId) : undefined;
        const due = formatDue(f.dueAt);
        return (
          <li
            key={f.id}
            className="rounded-card border border-kelly-text/10 bg-kelly-page/90 p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-heading text-sm font-bold text-kelly-text">{f.title}</p>
              {due ? <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/45">Due {due}</p> : null}
            </div>
            <p className="mt-2 text-sm text-kelly-text/75">{f.detail}</p>
            <p className="mt-2 text-xs text-kelly-text/55">
              Owner: <span className="font-semibold text-kelly-text/70">{f.ownerRoleLabel}</span>
            </p>
            {packet ? (
              <p className="mt-2 text-xs text-kelly-text/55">
                Linked packet: <span className="font-medium text-kelly-text/75">{packet.title}</span>
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
