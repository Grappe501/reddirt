import { COMMS_APP_PATHS } from "@/lib/comms-workbench/comms-nav";

/** Preserves other query params when submitting a text search (GET). */
export function PlanListSearchForm({ baseQuery }: { baseQuery: Record<string, string | undefined> }) {
  const q = baseQuery.q ?? "";
  return (
    <form method="get" action={COMMS_APP_PATHS.plans} className="mb-2 flex max-w-md flex-wrap items-center gap-2">
      {Object.entries(baseQuery).map(([k, v]) => {
        if (k === "q" || v == null || v === "") return null;
        return <input type="hidden" key={k} name={k} value={v} />;
      })}
      <input
        name="q"
        defaultValue={q}
        placeholder="Search title or summary…"
        className="min-w-[12rem] flex-1 rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm text-kelly-text"
        aria-label="Search plans"
      />
      <button
        type="submit"
        className="rounded border border-kelly-slate/30 bg-kelly-slate/10 px-2 py-1 text-xs font-semibold text-kelly-slate"
      >
        Search
      </button>
    </form>
  );
}
