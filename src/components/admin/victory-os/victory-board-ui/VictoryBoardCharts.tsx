"use client";

import type { VictoryBoardChartSeries } from "@/lib/victory-os/victory-board/types";

export function VictoryBoardCharts({ charts }: { charts: VictoryBoardChartSeries[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {charts.map((chart) => (
        <ChartCard key={chart.id} chart={chart} />
      ))}
    </div>
  );
}

function ChartCard({ chart }: { chart: VictoryBoardChartSeries }) {
  const max = Math.max(...chart.bars.map((b) => b.value), 1);

  return (
    <div className="rounded-2xl border border-kelly-text/10 bg-white p-4">
      <h3 className="font-heading text-sm font-bold text-kelly-navy">{chart.title}</h3>
      {chart.subtitle ? <p className="mt-0.5 font-body text-[11px] text-kelly-muted">{chart.subtitle}</p> : null}
      <div className="mt-3 space-y-2">
        {chart.bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-xs text-kelly-slate">{bar.label}</span>
              <span className="font-body text-xs font-semibold tabular-nums text-kelly-navy">
                {bar.value}
                {bar.pct != null ? ` (${bar.pct}%)` : ""}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-kelly-page/80">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(4, (bar.value / max) * 100)}%`, backgroundColor: bar.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
