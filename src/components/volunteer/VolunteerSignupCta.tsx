import { Button } from "@/components/ui/Button";
import { buildVolunteerSignupUrl, type VolunteerSignupRoleQuery } from "@/lib/campaign-links";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "primary" | "outline" | "secondary";
  /** When set, appended as `?role=` before URL hash (future form + automation compatibility). */
  roleQuery?: VolunteerSignupRoleQuery | null;
};

export function VolunteerSignupCta({ className, variant = "primary", roleQuery = null }: Props) {
  const href = buildVolunteerSignupUrl(roleQuery);
  return (
    <Button href={href} variant={variant} className={cn("min-h-[48px] w-full sm:w-auto", className)}>
      Complete volunteer signup
    </Button>
  );
}
