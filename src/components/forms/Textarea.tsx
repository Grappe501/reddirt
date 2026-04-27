import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[140px] w-full resize-y rounded-card border border-kelly-text/20 bg-kelly-page px-4 py-3 text-base text-kelly-text shadow-inner placeholder:text-kelly-text/40 focus:border-kelly-navy focus:outline-none focus:ring-2 focus:ring-kelly-navy/25",
        className,
      )}
      {...props}
    />
  );
}
