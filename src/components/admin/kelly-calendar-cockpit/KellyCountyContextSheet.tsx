"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { CountyBasicsStrip } from "@/lib/calendar/kelly-county-basics";

type Props = {
  open: boolean;
  onClose: () => void;
  countyLabel: string;
  countyBasics: CountyBasicsStrip;
  eventId: string;
};

const offsite = { target: "_blank" as const, rel: "noopener noreferrer" };

export function KellyCountyContextSheet({ open, onClose, countyLabel, countyBasics, eventId }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const linkCls =
    "flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-3 text-left font-body text-[11px] font-bold text-zinc-900 shadow-sm active:bg-zinc-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end md:items-stretch" aria-modal role="dialog">
      <button type="button" className="absolute inset-0 bg-black/45" aria-label="Close county context" onClick={onClose} />
      <div
        className="relative z-[101] flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl border border-zinc-200/90 bg-[#fdfbf7] shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.35)] md:h-full md:max-h-none md:max-w-md md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0 md:shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200/80 px-4 py-3">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">County context</p>
            <p className="font-heading text-lg font-bold text-zinc-900">{countyLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 font-body text-[11px] font-bold text-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-8">
          <section>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">County brief</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 font-body text-[11px] text-zinc-700">
              <div>
                <dt className="text-zinc-400">Seat</dt>
                <dd className="font-medium text-zinc-900">{countyBasics.countySeat}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Population</dt>
                <dd>{countyBasics.population}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Poverty</dt>
                <dd>{countyBasics.povertyRate}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Unemployment</dt>
                <dd>{countyBasics.unemploymentRate}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Registered voters</dt>
                <dd>{countyBasics.registeredVoters}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Turnout</dt>
                <dd>{countyBasics.recentTurnout}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Last Kelly touch</dt>
                <dd>{countyBasics.lastKellyTouch}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">Touches (Nov 1+)</dt>
                <dd>{countyBasics.touchesSinceNov1Line}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-zinc-400">Priority / meeting</dt>
                <dd>
                  {countyBasics.priorityTier} · {countyBasics.countyMeetingStatus}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-zinc-400">Local guide</dt>
                <dd>{countyBasics.localGuideLine}</dd>
              </div>
            </dl>
          </section>

          <section className="space-y-2">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Deep links</p>
            <p className="font-body text-[10px] text-zinc-500">Opens in a new tab so this cockpit stays in place.</p>
            <div className="flex flex-col gap-2">
              <Link href="/admin/counties" className={linkCls} {...offsite}>
                County coordination hub
                <span className="text-zinc-400">↗</span>
              </Link>
              <Link href="/admin/county-intelligence" className={linkCls} {...offsite}>
                Election / voter snapshot (aggregate intel)
                <span className="text-zinc-400">↗</span>
              </Link>
              <Link href="/admin/county-profiles" className={linkCls} {...offsite}>
                County profiles engine
                <span className="text-zinc-400">↗</span>
              </Link>
              <Link href="/admin/calendar-command-center" className={linkCls} {...offsite}>
                Past Kelly touches (full calendar board)
                <span className="text-zinc-400">↗</span>
              </Link>
              <Link href="/admin/workbench/calendar" className={linkCls} {...offsite}>
                Nearby opportunities (Calendar HQ)
                <span className="text-zinc-400">↗</span>
              </Link>
              <Link href="/admin/calendar-command-center" className={linkCls} {...offsite}>
                Open full calendar dashboard
                <span className="text-zinc-400">↗</span>
              </Link>
              <Link href={`/admin/calendar-command-center/event/${encodeURIComponent(eventId)}`} className={linkCls} {...offsite}>
                This event — full detail
                <span className="text-zinc-400">↗</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
