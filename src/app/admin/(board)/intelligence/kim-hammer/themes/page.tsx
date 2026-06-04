import Link from "next/link";
import { loadDebateIntelligenceV4SurfacePacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { V4ThemeMatrix } from "@/components/admin/intelligence/v4/V4ThemeMatrix";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

/** v4 theme matrix — no full workbench graph (Netlify-safe). */
export default function KimHammerThemesPage() {
  const v4 = loadDebateIntelligenceV4SurfacePacket();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Election record · v4 themes"
        title="Theme matrix"
        description="Pattern view for debate: voters hear 'integrity package' not isolated bill numbers. Pick one theme to own tonight (usually county burden or direct democracy), cite theme first then bills. Links to drill-down for act proof."
        guide={getSurfaceGuide("themeMatrix")}
      >
        <V4BackLinks />
        <Link href="/admin/intelligence" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Hub
        </Link>
      </V4PageHeader>
      <V4ThemeMatrix rows={v4.themeMatrix} />
    </div>
  );
}
