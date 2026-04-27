export default function AdminInsightsPlaceholderPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Insights</h1>
      <p className="mt-3 font-body text-sm text-kelly-text/75">
        Placeholder for engagement snapshots, connector health trends, and editorial KPIs. The orchestrator already
        stores normalized content and optional <code className="text-xs">metrics</code> JSON on inbound items for
        future use.
      </p>
      <p className="mt-6 font-body text-sm text-kelly-text/60">
        No charts in this script — intake and routing first.
      </p>
    </div>
  );
}
