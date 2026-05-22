import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-btn border border-kelly-border bg-[var(--color-surface-elevated)] px-4 py-3 text-base text-kelly-text shadow-inner placeholder:text-kelly-muted focus:border-kelly-navy focus:outline-none focus:ring-2 focus:ring-kelly-navy/25",
        className,
      )}
      {...props}
    />
  );
}
