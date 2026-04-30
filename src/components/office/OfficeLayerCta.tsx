import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type OfficeLayerCtaProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
};

export function OfficeLayerCta({ href, label, variant = "primary", className }: OfficeLayerCtaProps) {
  return (
    <Button href={href} variant={variant} className={cn("min-w-[12rem]", className)}>
      {label}
    </Button>
  );
}
