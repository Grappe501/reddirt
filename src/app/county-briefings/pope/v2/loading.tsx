import { CountyDashboardShell } from "@/components/county/dashboard";

/** Skeleton for dynamic county dashboard — matches shell width and major blocks. */
export default function PopeCountyDashboardV2Loading() {
  return (
    <CountyDashboardShell>
      <div className="animate-pulse" aria-busy="true" aria-label="Loading county dashboard">
        <div className="h-4 w-56 rounded bg-kelly-text/10" />
        <div className="mt-4 h-10 max-w-lg rounded-lg bg-kelly-text/10" />
        <div className="mt-2 h-5 w-40 rounded bg-kelly-text/10" />
        <div className="mt-4 h-20 max-w-3xl rounded-md bg-kelly-text/[0.06]" />
        <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-kelly-text/10 bg-kelly-page/80" />
          ))}
        </div>
        <div className="mt-8 h-48 rounded-2xl border border-kelly-text/10 bg-kelly-text/[0.04]" />
      </div>
    </CountyDashboardShell>
  );
}
