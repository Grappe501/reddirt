"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { className?: string }>(
  ({ className, ...p }, ref) => <div ref={ref} className={cn("rounded-lg border border-slate-200 bg-white text-slate-950", className)} {...p} />
);
Card.displayName = "Card";

export function CardHeader({ className, ...p }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...p} />;
}

export function CardTitle({ className, ...p }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...p} />;
}

export function CardDescription({ className, ...p }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-slate-500", className)} {...p} />;
}

export function CardContent({ className, ...p }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...p} />;
}

type UiButtonProps = React.ComponentProps<"button"> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
};

export const UiButton = React.forwardRef<HTMLButtonElement, UiButtonProps>(function UiButton(
  { className, variant = "default", size = "default", type = "button", ...p },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 rounded-md px-3" : "h-10 rounded-md px-4 py-2",
        variant === "default" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "outline" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-100",
        variant === "ghost" && "hover:bg-slate-100",
        className
      )}
      {...p}
    />
  );
});

export function UiInput({ className, ...p }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
        className
      )}
      {...p}
    />
  );
}

export function UiTextarea({ className, ...p }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
        className
      )}
      {...p}
    />
  );
}

export function UiBadge({ className, ...p }: React.ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center rounded-md border border-slate-200 px-2.5 py-0.5 text-xs font-semibold", className)} {...p} />;
}

export function UiProgress({ className, value = 0 }: { className?: string; value?: number }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200", className)}>
      <div className="h-full bg-slate-800 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function UiScrollArea({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("overflow-y-auto", className)}>{children}</div>;
}

export function UiSeparator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-slate-200", className)} role="separator" />;
}

type TabCtx = { value: string; onChange: (v: string) => void };
const TabContext = React.createContext<TabCtx | null>(null);

export function UiTabs({ defaultValue, className, children }: { defaultValue: string; className?: string; children: React.ReactNode }) {
  const [value, onChange] = React.useState(() => defaultValue);
  return (
    <TabContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabContext.Provider>
  );
}

export function UiTabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className} role="tablist">{children}</div>;
}

export function UiTabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabContext);
  if (!ctx) return null;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  );
}

export function UiTabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabContext);
  if (!ctx || ctx.value !== value) return null;
  return (
    <div className={className} role="tabpanel">
      {children}
    </div>
  );
}

type NativeSelectOption = { value: string; label: string };
export function NativeSelect({
  value,
  onValueChange,
  options,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: NativeSelectOption[];
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-slate-300",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function UiAvatar({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full", className)}>{children}</div>;
}

export function UiAvatarFallback({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("text-xs font-medium", className)}>{children}</span>;
}
