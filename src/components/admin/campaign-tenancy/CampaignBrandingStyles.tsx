/** Injects tenant CSS variables for white-label dashboards (Sprint 10 scaffold). */

export function CampaignBrandingStyles({
  primaryColor,
  accentColor,
}: {
  primaryColor: string;
  accentColor: string;
}) {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { --campaign-tenant-primary: ${primaryColor}; --campaign-tenant-accent: ${accentColor}; }`,
      }}
    />
  );
}
