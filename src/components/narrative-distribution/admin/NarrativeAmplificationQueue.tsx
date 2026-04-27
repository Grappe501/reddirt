import type { AmplificationQueueItem } from "@/lib/narrative-distribution/types";
import { getDemoNarrativePacketById } from "@/lib/narrative-distribution/assets";

type Props = { items: AmplificationQueueItem[] };

function formatDue(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function NarrativeAmplificationQueue({ items }: Props) {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="overflow-x-auto rounded-card border border-kelly-text/10 bg-kelly-page/90 shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-kelly-text/10 bg-kelly-text/[0.03] text-[10px] font-bold uppercase tracking-widest text-kelly-text/50">
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Ask</th>
            <th className="px-4 py-3">Packet</th>
            <th className="px-4 py-3">Script ref</th>
            <th className="px-4 py-3">Channels</th>
            <th className="px-4 py-3">Due</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const packet = getDemoNarrativePacketById(row.narrativePacketId);
            const scriptRef = row.scriptTemplateId ?? row.scriptAssetId ?? "—";
            const channels = row.channelHints?.join(", ") ?? "—";
            return (
              <tr key={row.id} className="border-b border-kelly-text/5 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-kelly-text/60">{row.sortOrder}</td>
                <td className="px-4 py-3 font-medium text-kelly-text">{row.title}</td>
                <td className="px-4 py-3 text-kelly-text/80">{packet?.title ?? row.narrativePacketId}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-kelly-text/55">{scriptRef}</td>
                <td className="px-4 py-3 text-xs text-kelly-text/65">{channels}</td>
                <td className="px-4 py-3 text-xs text-kelly-text/70">{formatDue(row.dueAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
