import Link from "next/link";
import {
  computeStrategicAlignment,
  loadCampaignStrategicDoctrineRegistry,
} from "@/lib/intelligence/campaignStrategicAlignment";
import { StrategyAlignmentChunkPreviewStrip } from "@/components/admin/intelligence/strategy-alignment/StrategyAlignmentChunkPreviewStrip";
import { StrategyAlignmentDashboard } from "./StrategyAlignmentDashboard";

export default async function StrategyAlignmentPage() {
  const index = computeStrategicAlignment();
  const doctrineRegistry = loadCampaignStrategicDoctrineRegistry();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          SDI-1 · Strategic Doctrine Intelligence
        </p>
        <h1 className="font-heading text-2xl font-bold">Strategy Alignment Command</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Read-only doctrine-aware composition across governed narratives, county overlays, export usage, and campaign
          planning corpus. Evaluates strategic coherence — not autonomous strategy generation.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence hub
          </Link>
          <Link
            href="/admin/intelligence/kim-hammer/evidence-command"
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Evidence Command
          </Link>
          <Link
            href="/admin/intelligence/kim-hammer/narrative-state"
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Narrative state (NSI-1)
          </Link>
          <Link
            href="/admin/intelligence/strategy-alignment-chunk-preview"
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Chunk preview (P6)
          </Link>
        </div>
      </header>

      <StrategyAlignmentChunkPreviewStrip />

      <StrategyAlignmentDashboard index={index} doctrineRegistry={doctrineRegistry} />
    </div>
  );
}
