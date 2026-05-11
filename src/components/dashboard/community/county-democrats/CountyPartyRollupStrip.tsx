import { TwentySquareProgress } from "@/components/dashboard/vos/TwentySquareProgress";
import { COUNTY_PARTY_ROLLUP_TWENTY_SQUARE_SEED } from "@/lib/campaign-ops/county-democrats-dashboard-plan";

export function CountyPartyRollupStrip() {
  return (
    <div className="space-y-5 rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-sm">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/55">Lane momentum · 20-square (demo)</p>
      {COUNTY_PARTY_ROLLUP_TWENTY_SQUARE_SEED.map((row) => (
        <TwentySquareProgress key={row.id} label={row.label} percent={row.percent} />
      ))}
    </div>
  );
}
