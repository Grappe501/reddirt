import Link from "next/link";
import { CountyCommandHub } from "@/components/county/CountyCommandHub";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { listArkansasCountyCommandRoster } from "@/lib/county/get-county-command-data";
import { getCountyWorkbenchPortalUrl } from "@/lib/county/county-workbench-portal-url";

export const dynamic = "force-dynamic";

export default async function AdminCountiesPage() {
  const rows = await listArkansasCountyCommandRoster();
  const countyPortal = getCountyWorkbenchPortalUrl();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-kelly-text">County command — master workbench</h1>
      <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
        All <strong>75</strong> Arkansas counties in this database power the{" "}
        <strong>Kelly SOS public</strong> county index at{" "}
        <Link href="/counties" className="font-semibold text-kelly-navy hover:underline" target="_blank" rel="noreferrer">
          /counties
        </Link>{" "}
        on <strong>this</strong> site (registration goals, published tiers, voter center handoffs). The{" "}
        <strong>county coordination hub</strong> (separate Netlify app — Pope reference dashboard, regional operator directory, county
        brief shells) opens in a new tab when configured below.
      </p>

      {countyPortal ? (
        <div className="mt-5 max-w-3xl rounded-xl border-2 border-kelly-navy/25 bg-kelly-navy/[0.04] px-4 py-4">
          <p className="font-heading text-sm font-bold text-kelly-navy">County coordination hub (live)</p>
          <p className="mt-1 font-body text-xs text-kelly-text/75">
            75-county portal, Pope-first metrics, <code className="rounded bg-kelly-text/5 px-1">/counties</code> by region — sister
            deploy, not this codebase&apos;s <code className="rounded bg-kelly-text/5 px-1">/counties</code>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`${countyPortal}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-kelly-navy px-4 py-2 font-body text-sm font-semibold text-kelly-page shadow-sm transition hover:bg-kelly-navy/90"
            >
              Open hub home ↗
            </a>
            <a
              href={`${countyPortal}/counties`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-kelly-navy/35 bg-kelly-page px-4 py-2 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-navy/60"
            >
              Regional directory ↗
            </a>
            <a
              href={`${countyPortal}/workbench`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-kelly-text/15 bg-kelly-page px-4 py-2 font-body text-sm font-semibold text-kelly-text transition hover:border-kelly-text/30"
            >
              Statewide workbench ↗
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-5 max-w-3xl rounded-lg border border-amber-600/30 bg-amber-50 px-4 py-3 font-body text-xs text-amber-950">
          <strong className="font-semibold">County hub URL not set.</strong> Add{" "}
          <code className="rounded bg-amber-100/80 px-1">NEXT_PUBLIC_COUNTY_WORKBENCH_URL</code> to this site&apos;s Netlify environment
          (no trailing slash), redeploy RedDirt, then this page and the admin sidebar will link to the live county workbench.
        </div>
      )}

      <p className="mt-4 max-w-3xl text-sm text-kelly-muted">
        <strong>CMS</strong> links in the grid open this admin editor; add DB rows for missing counties with{" "}
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
