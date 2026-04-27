import type { EditorialStatus, NarrativePacket } from "@/lib/narrative-distribution/types";
import { EDITORIAL_STATUSES } from "@/lib/narrative-distribution/types";

type PacketRow = NarrativePacket & { editorialStatusView: EditorialStatus };

type Props = { packets: PacketRow[] };

const STATUS_ORDER: EditorialStatus[] = [...EDITORIAL_STATUSES];

export function NarrativeEditorialStatusBoard({ packets }: Props) {
  const byStatus = new Map<EditorialStatus, PacketRow[]>();
  for (const s of STATUS_ORDER) byStatus.set(s, []);
  for (const p of packets) {
    const list = byStatus.get(p.editorialStatusView);
    if (list) list.push(p);
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[900px] gap-3">
        {STATUS_ORDER.map((status) => {
          const col = byStatus.get(status) ?? [];
          return (
            <div
              key={status}
              className="min-w-[200px] flex-1 rounded-card border border-kelly-text/10 bg-kelly-page/80 shadow-[var(--shadow-soft)]"
            >
              <div className="border-b border-kelly-text/10 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/50">{status.replace(/_/g, " ")}</p>
                <p className="font-heading text-lg font-bold text-kelly-navy">{col.length}</p>
              </div>
              <ul className="max-h-[320px] space-y-2 overflow-y-auto p-2">
                {col.map((p) => (
                  <li key={p.id} className="rounded-lg border border-kelly-text/8 bg-white/80 p-2.5 text-xs">
                    <p className="font-semibold text-kelly-text">{p.title}</p>
                    <p className="mt-1 line-clamp-2 text-kelly-text/60">{p.summary}</p>
                    {p.isDemoPlaceholder ? (
                      <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-kelly-text/45">Demo</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
