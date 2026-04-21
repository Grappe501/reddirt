import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-deep-soil/30 text-red-dirt focus:ring-red-dirt/40",
        className,
      )}
      {...props}
    />
  );
}
