"use client";

import { useId } from "react";
import type { EventStatus, EventType } from "@/content/types";
import type { EventSchedulePreset } from "@/lib/format/event-schedule-in-zone";
import { cn } from "@/lib/utils";

export type EventFiltersState = {
  type: EventType | "all";
  region: string | "all";
  status: EventStatus | "all";
  audience: string | "all";
  /** Central Time windows for field scheduling */
  schedule: EventSchedulePreset;
  /** Merge published CampaignOS events onto the movement map (same gating as /campaign-calendar). */
  includeCalendar: boolean;
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
      <FilterSelect
        id={`${baseId}-schedule`}
        label="Schedule window"
        value={value.schedule}
        onChange={(v) => onChange({ ...value, schedule: v as EventFiltersState["schedule"] })}
        options={[
          { label: "Any day", value: "all" },
          { label: "Today (CT)", value: "today" },
          { label: "This week (CT)", value: "this_week" },
          { label: "Still ahead", value: "upcoming" },
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
      <label className="flex min-w-[14rem] cursor-pointer items-center gap-2 rounded-btn border border-deep-soil/15 bg-cream-canvas px-3 py-2.5 font-body text-sm text-deep-soil shadow-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-deep-soil/30 text-red-dirt focus:ring-red-dirt/30"
          checked={value.includeCalendar}
          onChange={(e) => onChange({ ...value, includeCalendar: e.target.checked })}
        />
        <span>
          <span className="font-bold">Campaign calendar</span>
          <span className="block text-xs text-deep-soil/65">Published HQ events on the same map</span>
        </span>
      </label>
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
              schedule: "all",
              includeCalendar: true,
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
