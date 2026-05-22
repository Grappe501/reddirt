"use client";

import { useState, type ReactNode } from "react";

export function PlanningSection({
  title,
  subtitle,
  defaultOpen = false,
  complete,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  complete?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div>
          <p className="font-heading text-base font-bold text-kelly-navy">
            {title}
            {complete ? (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                Done
              </span>
            ) : null}
          </p>
          {subtitle ? <p className="mt-1 font-body text-xs text-kelly-muted">{subtitle}</p> : null}
        </div>
        <span className="shrink-0 text-sm text-kelly-slate">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="border-t border-kelly-text/10 px-4 pb-4 pt-3">
          {children}
          {footer ? <div className="mt-4 flex flex-wrap gap-2 border-t border-kelly-text/10 pt-3">{footer}</div> : null}
        </div>
      ) : null}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  const cls = "mt-1 w-full rounded-lg border border-kelly-text/15 bg-kelly-wash/30 px-3 py-2 font-body text-sm";
  return (
    <label className="block font-body text-sm">
      <span className="text-xs font-semibold text-kelly-muted">{label}</span>
      {hint ? <span className="ml-1 text-[10px] text-kelly-subtle">{hint}</span> : null}
      {multiline ? (
        <textarea className={cls} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
