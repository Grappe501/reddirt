import { notFound } from "next/navigation";
import { saveCountyCommandPageAction } from "@/app/admin/county-admin-actions";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { prisma } from "@/lib/db";
import { CountyContentReviewStatus, PublicDemographicsSource } from "@prisma/client";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> };

export const dynamic = "force-dynamic";

const reviewOptions: CountyContentReviewStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
];

const sourceOptions = Object.values(PublicDemographicsSource);

export default async function AdminCountyEditPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { saved } = await searchParams;
  await requireAdminAction();
  const c = await prisma.county.findFirst({
    where: { slug },
    include: {
      campaignStats: true,
      demographics: true,
      elected: { orderBy: [{ jurisdiction: "asc" }, { sortOrder: "asc" }] },
    },
  });
  if (!c) notFound();

  const s = c.campaignStats;
  const d = c.demographics;

  return (
    <div>
      {saved ? (
        <p className="mb-6 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Saved.</p>
      ) : null}
      <h1 className="font-heading text-2xl font-bold text-kelly-text">{c.displayName}</h1>
      <p className="mt-1 text-xs text-kelly-text/55">
        Slug: {c.slug} · FIPS: {c.fips}
      </p>

      <form action={saveCountyCommandPageAction} className="mt-8 max-w-3xl space-y-10">
        <input type="hidden" name="countyId" value={c.id} />

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-kelly-text">Public page</h2>
          <label className="block text-sm">
            <span className="font-medium">Display name</span>
            <input
              className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
              name="displayName"
              defaultValue={c.displayName}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={c.published} className="rounded border-kelly-text/30" />
            Published (visible on /counties)
          </label>
          <label className="block text-sm">
            <span className="font-medium">Region / hero eyebrow</span>
            <input
              className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
              name="regionLabel"
              defaultValue={c.regionLabel ?? ""}
              placeholder="e.g. Central Arkansas"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Hero kicker (optional, overrides region line)</span>
            <input
              className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
              name="heroEyebrow"
              defaultValue={c.heroEyebrow ?? ""}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Hero intro</span>
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-md border border-kelly-text/20 px-3 py-2 font-body"
              name="heroIntro"
              defaultValue={c.heroIntro ?? ""}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Lead name</span>
            <input
              className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
              name="leadName"
              defaultValue={c.leadName ?? ""}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Lead title</span>
            <input
              className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
              name="leadTitle"
              defaultValue={c.leadTitle ?? ""}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Featured event slugs (comma or newline; match `src/content/events`)</span>
            <textarea
              className="mt-1 min-h-[64px] w-full rounded-md border border-kelly-text/20 px-3 py-2 font-mono text-sm"
              name="featuredEventSlugs"
              defaultValue={c.featuredEventSlugs.join(", ")}
            />
          </label>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-kelly-text">Campaign metrics</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Registration goal</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="registrationGoal"
                type="number"
                defaultValue={s?.registrationGoal ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">New registrations (since baseline) — from voter file</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="newRegistrationsSinceBaseline"
                type="number"
                defaultValue={s?.newRegistrationsSinceBaseline ?? ""}
                placeholder="Leave empty until pipeline syncs"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Volunteer target</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="volunteerTarget"
                type="number"
                defaultValue={s?.volunteerTarget ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Volunteer count (field)</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="volunteerCount"
                type="number"
                defaultValue={s?.volunteerCount ?? ""}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Campaign visits (count)</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="campaignVisits"
                type="number"
                defaultValue={s?.campaignVisits ?? ""}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Pipeline source label</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2 font-mono text-sm"
                name="dataPipelineSource"
                defaultValue={s?.dataPipelineSource ?? ""}
                placeholder="e.g. voter_file_nightly"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Pipeline / sync notes</span>
              <textarea
                className="mt-1 min-h-[64px] w-full rounded-md border border-kelly-text/20 px-3 py-2 font-mono text-sm"
                name="pipelineError"
                defaultValue={s?.pipelineError ?? ""}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Review status</span>
              <select
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="statsReviewStatus"
                defaultValue={s?.reviewStatus ?? "PENDING_REVIEW"}
              >
                {reviewOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-kelly-text">Public demographics (intelligence cards)</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Population</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="population"
                type="number"
                defaultValue={d?.population ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Voting-age population</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="votingAgePopulation"
                type="number"
                defaultValue={d?.votingAgePopulation ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Median household income</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="medianHouseholdIncome"
                type="number"
                defaultValue={d?.medianHouseholdIncome ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Poverty rate (%)</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="povertyRatePercent"
                step="0.1"
                defaultValue={d?.povertyRatePercent ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Bachelor&apos;s+ (%)</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="bachelorsOrHigherPercent"
                step="0.1"
                defaultValue={d?.bachelorsOrHigherPercent ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">As of year</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="asOfYear"
                type="number"
                defaultValue={d?.asOfYear ?? ""}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Labor / employment note</span>
              <textarea
                className="mt-1 min-h-[64px] w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="laborEmploymentNote"
                defaultValue={d?.laborEmploymentNote ?? ""}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Source enum</span>
              <select
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="demographicsSource"
                defaultValue={d?.source ?? "CENSUS_ACS"}
              >
                {sourceOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Source detail (e.g. ACS 2022, table IDs)</span>
              <input
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="sourceDetail"
                defaultValue={d?.sourceDetail ?? ""}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Review status</span>
              <select
                className="mt-1 w-full rounded-md border border-kelly-text/20 px-3 py-2"
                name="demographicsReviewStatus"
                defaultValue={d?.reviewStatus ?? "PENDING_REVIEW"}
              >
                {reviewOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-kelly-text">Elected officials (read-only in this form)</h2>
          <p className="mt-1 text-sm text-kelly-text/70">
            {c.elected.length} row(s) in the database. Approve in Prisma/CSV import for now; public page shows only
            APPROVED.
          </p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-kelly-text/70">
            {c.elected.map((o) => (
              <li key={o.id}>
                {o.jurisdiction} · {o.officeTitle} — {o.name} ({o.reviewStatus})
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-md bg-kelly-gold px-4 py-2.5 text-sm font-semibold text-kelly-navy shadow-soft transition hover:brightness-105"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
