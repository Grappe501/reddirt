import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[140px] w-full resize-y rounded-card border border-deep-soil/20 bg-cream-canvas px-4 py-3 text-base text-deep-soil shadow-inner placeholder:text-deep-soil/40 focus:border-red-dirt focus:outline-none focus:ring-2 focus:ring-red-dirt/25",
        className,
      )}
      {...props}
    />
  );
}
