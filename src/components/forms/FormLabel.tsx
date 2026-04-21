import { cn } from "@/lib/utils";

export function FormLabel({
  className,
  children,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-semibold text-deep-soil", className)}
      {...props}
    >
      {children}
    </label>
  );
}
