import type { PopeDemoRelationalGraph } from "@/lib/power-of-5/demo/pope-seed";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { cn } from "@/lib/utils";

type Props = {
  graph: PopeDemoRelationalGraph;
  className?: string;
};

/**
 * SVG aggregate view of the Pope-only demo graph — no interactivity, no real identities.
 */
export function PopeRelationalGraphDemoPanel({ graph, className }: Props) {
  const pos = new Map<string, { x: number; y: number; leader: boolean }>();
  for (const block of graph.layout) {
    for (const n of block.nodes) {
      pos.set(n.nodeId, { x: n.xPct, y: n.yPct, leader: n.isLeader });
    }
  }

  const { summary } = graph;

  return (
    <section className={cn(className)}>
      <CountySectionHeader
        overline="Power of 5 · Demo graph"
        title="Relational coverage (synthetic)"
        description={
          <>
            Ten Power Teams in Pope County — six complete rosters, four still forming. Nodes are anonymous roster placeholders; edges show leader ties
            and a few mentor bridges. Matches the numeric strip above. No voter file or contact tokens.
          </>
        }
      />
      <div className={cn(countyDashboardCardClass, "mt-4 overflow-x-auto")}>
        <svg
          viewBox="0 0 100 86"
          className="h-auto min-w-[320px] w-full max-w-3xl text-kelly-navy"
          role="img"
          aria-label="Diagram of ten demo Power Teams as node clusters with leader spokes"
        >
          <title>Pope County demo relational graph</title>
          {graph.edges.map((e) => {
            const a = pos.get(e.fromNodeId);
            const b = pos.get(e.toNodeId);
            if (!a || !b) return null;
            const dashed = e.kind === "mentor";
            const thin = e.kind === "invited";
            return (
              <line
                key={e.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={thin ? 0.2 : 0.35}
                className={dashed ? "stroke-kelly-slate/40" : "stroke-kelly-navy/35"}
                strokeDasharray={dashed ? "1.2 1.2" : undefined}
              />
            );
          })}

          {graph.layout.map((block) => (
            <g key={block.teamId}>
              <rect
                x={block.cxPct - 9.5}
                y={block.cyPct - 9.5}
                width={19}
                height={19}
                rx={2.5}
                className={cn(
                  "fill-none stroke-[0.35]",
                  block.status === "complete" ? "stroke-emerald-700/45" : "stroke-amber-700/50",
                )}
              />
              {block.nodes.map((n) => {
                const isLeader = n.isLeader;
                return (
                  <circle
                    key={n.nodeId}
                    cx={n.xPct}
                    cy={n.yPct}
                    r={isLeader ? 1.35 : 0.95}
                    className={cn(
                      isLeader ? "fill-kelly-navy" : "fill-kelly-slate/85",
                      graph.nodes.find((node) => node.id === n.nodeId)?.status === "invited"
                        ? "opacity-55"
                        : "",
                    )}
                  />
                );
              })}
            </g>
          ))}
        </svg>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-kelly-text/10 pt-3 text-xs text-kelly-text/75">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-kelly-navy" /> Leader
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-kelly-slate/85" /> Member
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-kelly-slate/85 opacity-55" /> Invited roster slot
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded border border-emerald-700/55 bg-transparent" /> Complete team
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded border border-amber-700/55 bg-transparent" /> Forming team
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-px w-4 bg-kelly-slate/50" /> Mentor bridge
          </span>
        </div>

        <dl className="mt-3 grid gap-2 text-xs text-kelly-text/70 sm:grid-cols-2">
          <div>
            <dt className="font-bold text-kelly-text/55">Users (synthetic)</dt>
            <dd>
              {summary.userCount} total · {summary.usersWithNode} on rosters · {summary.pipelineUsersWithoutNode} in pipeline (no node yet)
            </dd>
          </div>
          <div>
            <dt className="font-bold text-kelly-text/55">Teams · activity</dt>
            <dd>
              {summary.teamCount} teams ({summary.completeTeamCount} complete / {summary.formingTeamCount} forming) · {summary.edgeCount} edges ·{" "}
              {summary.activityCount} logged touches (incl. {summary.conversationActivities} conversations)
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
