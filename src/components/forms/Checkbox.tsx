import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-kelly-text/30 text-kelly-navy focus:ring-kelly-navy/40",
        className,
      )}
      {...props}
    />
  );
}
