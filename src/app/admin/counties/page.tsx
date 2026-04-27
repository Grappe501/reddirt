import Link from "next/link";
import { CountyCommandHub } from "@/components/county/CountyCommandHub";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { listArkansasCountyCommandRoster } from "@/lib/county/get-county-command-data";

export const dynamic = "force-dynamic";

export default async function AdminCountiesPage() {
  await requireAdminAction();
  const rows = await listArkansasCountyCommandRoster();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-kelly-text">County command — master workbench</h1>
      <p className="mt-2 max-w-3xl text-sm text-kelly-text/70">
        All <strong>75</strong> Arkansas counties (normalized list + FIPS) match public routes at{" "}
        <code className="rounded bg-kelly-text/5 px-1">/counties/[slug]</code> and the{" "}
        <Link href="/counties" className="font-semibold text-kelly-navy hover:underline" target="_blank" rel="noreferrer">
          public workbench
        </Link>
        . <strong>CMS</strong> links open this admin editor; add DB rows for missing counties with{" "}
        <code className="rounded bg-kelly-text/5 px-1">npx prisma db seed</code> from the RedDirt folder (or create rows in Prisma) so
        every county can carry metrics and copy.
      </p>

      <div className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page/80 p-4 text-sm text-kelly-text/80">
        <p>
          <strong>Regions</strong> are the eight field buckets in <code>arkansas-county-registry.ts</code>—use that file to adjust labels or
          move a county between regions if field ops reassigns coverage.
        </p>
      </div>

      <div className="mt-8">
        <ContentContainer wide>
          <CountyCommandHub counties={rows} mode="admin" />
        </ContentContainer>
      </div>
    </div>
  );
}
