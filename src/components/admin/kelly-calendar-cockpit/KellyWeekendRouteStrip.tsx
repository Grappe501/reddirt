"use client";

import Link from "next/link";
import type { WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";

export function KellyWeekendRouteStrip({
  plans,
  action,
}: {
  plans: WeekendRoutePlan[];
  action: (formData: FormData) => Promise<void>;
}) {
  if (!plans.length) return null;
  return (
    <div className="mb-5 space-y-3">
      <p className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">This weekend route (staff)</p>
      {plans.map((p) => (
        <div key={p.id} className="rounded-2xl border border-emerald-800/20 bg-emerald-50/90 px-4 py-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading text-sm font-bold leading-snug text-zinc-900">{p.title}</p>
              <p className="mt-1 font-body text-[11px] text-zinc-600">
                Week of {p.weekStart} · {p.countiesCovered.length} counties · ~{p.totalDriveMinutes} min drive · {p.routeTightness.replace(/_/g, " ")}
              </p>
              {p.overnightStops.length ? (
                <p className="mt-1 font-body text-[10px] text-amber-900">
                  Overnight: {p.overnightStops.map((o) => `${o.city} (${o.night})`).join(" · ")}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-1 font-body text-[9px] font-bold uppercase tracking-wide text-white">
              {p.staffRecommendation.replace(/_/g, " ")}
            </span>
          </div>
          {p.aiSummary ? <p className="mt-2 line-clamp-3 font-body text-[11px] text-zinc-700">{p.aiSummary}</p> : null}
          {p.risks.length ? (
            <p className="mt-2 font-body text-[10px] text-rose-800/90">
              <span className="font-bold">Risks:</span> {p.risks.slice(0, 2).join(" · ")}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <form action={action}>
              <input type="hidden" name="planId" value={p.id} />
              <input type="hidden" name="intent" value="approve" />
              <button type="submit" className="rounded-lg bg-emerald-800 px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-white">
                Approve route
              </button>
            </form>
            <form action={action}>
              <input type="hidden" name="planId" value={p.id} />
              <input type="hidden" name="intent" value="modify" />
              <button type="submit" className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-zinc-800">
                Modify
              </button>
            </form>
            <form action={action}>
              <input type="hidden" name="planId" value={p.id} />
              <input type="hidden" name="intent" value="send_local" />
              <button type="submit" className="rounded-lg border border-violet-300 bg-violet-50 px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-violet-950">
                Send local
              </button>
            </form>
            <form action={action}>
              <input type="hidden" name="planId" value={p.id} />
              <input type="hidden" name="intent" value="hold" />
              <button type="submit" className="rounded-lg border border-zinc-200 px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-zinc-600">
                Hold
              </button>
            </form>
            <Link
              href="/admin/calendar-command-center/opportunities#weekend-routes"
              className="inline-flex items-center rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1.5 font-body text-[10px] font-bold uppercase text-sky-950"
            >
              Compare routes
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
