export default function CampaignStrategyLoading() {
  return (
    <div className="max-w-[40rem] animate-pulse space-y-4 py-2" aria-busy="true" aria-label="Loading strategy chapter">
      <div className="h-3 w-28 rounded bg-kelly-fog" />
      <div className="h-9 w-4/5 max-w-md rounded bg-kelly-fog" />
      <div className="h-4 w-full rounded bg-kelly-fog/80" />
      <div className="h-4 w-11/12 rounded bg-kelly-fog/80" />
      <div className="h-32 w-full rounded-xl bg-kelly-fog/60" />
      <div className="h-4 w-full rounded bg-kelly-fog/80" />
    </div>
  );
}
