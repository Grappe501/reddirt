import { assertAdminApi } from "@/lib/admin/require-admin";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import { composeMondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";

export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const vm = composeMondayBriefViewModel(weekKeyFromParam(url.searchParams.get("week")));
  const { brief } = vm;

  const decisionsHtml = brief.topDecisions
    .map(
      (d) => `<div class="decision">
        <p class="decision-num">#${d.rank} ${escapeHtml(d.displayName)} [${d.opsStatus}] — ${d.status}</p>
        <p><strong>${escapeHtml(d.recommendation)}</strong></p>
        <p>${escapeHtml(d.reason)}</p>
        <p class="meta">Resource: ${escapeHtml(d.resourceType)} · Kelly T${d.kellyTier} · ${escapeHtml(d.expectedOutcome)}</p>
      </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Monday Brief · ${vm.weekKey}</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;color:#1a1a2e;line-height:1.5}
h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:1.5rem;border-bottom:1px solid #ccc}
.meta{font-size:.85rem;color:#555}.decision{margin:1rem 0;padding:.75rem;border:1px solid #ddd}
.decision-num{font-weight:bold;color:#1e3a5f}
@media print{body{margin:1rem}}
</style></head><body>
<p class="meta">Victory OS · INTERNAL_DRAFT · CM review required</p>
<h1>Monday Brief — Path to Victory</h1>
<p class="meta">Week ${vm.weekKey} · ${escapeHtml(vm.currentSeasonLabel ?? "")} · ${escapeHtml(vm.electionCountdown.label)}</p>
<p>${escapeHtml(brief.statewideVictory.summary)}</p>
<h2>Top 10 decisions</h2>${decisionsHtml}
<h2>Kelly deployment</h2><ul>${brief.kellyDeployment.map((d) => `<li>${escapeHtml(d.county)} · T${d.kellyTier}</li>`).join("") || "<li>None</li>"}</ul>
<h2>Counties at risk</h2><p>${brief.countiesAtRisk.map((c) => escapeHtml(c.county)).join(", ") || "None"}</p>
<p class="meta" style="margin-top:2rem">Planning scenario only — not a forecast.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
