"use client";

import { useId } from "react";
import type { EventStatus, EventType } from "@/content/types";
import { cn } from "@/lib/utils";

export type EventFiltersState = {
  type: EventType | "all";
  region: string | "all";
  status: EventStatus | "all";
  audience: string | "all";
};

type EventFilterBarProps = {
  types: EventType[];
  regions: string[];
  audienceTags: string[];
  value: EventFiltersState;
  onChange: (next: EventFiltersState) => void;
  className?: string;
};

export function EventFilterBar({
  types,
  regions,
  audienceTags,
  value,
  onChange,
  className,
}: EventFilterBarProps) {
  const baseId = useId();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-4 shadow-[var(--shadow-soft)] lg:flex-row lg:flex-wrap lg:items-end lg:gap-6 lg:p-6",
        className,
      )}
    >
      <FilterSelect
        id={`${baseId}-type`}
        label="Event type"
        value={value.type}
        onChange={(v) => onChange({ ...value, type: v as EventFiltersState["type"] })}
        options={[{ label: "All types", value: "all" }, ...types.map((t) => ({ label: t, value: t }))]}
      />
      <FilterSelect
        id={`${baseId}-region`}
        label="Region"
        value={value.region}
        onChange={(v) => onChange({ ...value, region: v })}
        options={[{ label: "All regions", value: "all" }, ...regions.map((r) => ({ label: r, value: r }))]}
      />
      <FilterSelect
        id={`${baseId}-status`}
        label="Timing"
        value={value.status}
        onChange={(v) => onChange({ ...value, status: v as EventFiltersState["status"] })}
        options={[
          { label: "Upcoming & past", value: "all" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Past", value: "past" },
        ]}
      />
      {audienceTags.length ? (
        <FilterSelect
          id={`${baseId}-audience`}
          label="Audience"
          value={value.audience}
          onChange={(v) => onChange({ ...value, audience: v })}
          options={[
            { label: "Any audience", value: "all" },
            ...audienceTags.map((t) => ({ label: t, value: t })),
          ]}
        />
      ) : null}
      <div className="lg:ml-auto">
        <button
          type="button"
          className="rounded-btn border border-deep-soil/20 px-4 py-2.5 font-body text-sm font-semibold text-deep-soil hover:bg-deep-soil/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt"
          onClick={() =>
            onChange({
              type: "all",
              region: "all",
              status: "all",
              audience: "all",
            })
          }
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="min-w-[12rem] flex-1">
      <label htmlFor={id} className="block font-body text-xs font-bold uppercase tracking-wider text-deep-soil/55">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-btn border border-deep-soil/15 bg-cream-canvas px-3 py-2.5 font-body text-sm text-deep-soil shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
