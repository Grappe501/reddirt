import { HOMEPAGE_SECTION_IDS, getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { saveHomepageAction } from "@/app/admin/actions";

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function AdminHomepagePage({ searchParams }: Props) {
  const sp = await searchParams;
  const merged = await getMergedHomepageConfig();
  const { hero, sectionOrder, quoteBand, finalCta } = merged;
  const sd = merged.splitDemocracy;
  const sl = merged.splitLabor;
  const ab = merged.arkansasBand;

  const sectionOrderText = sectionOrder.map((s) => s.id).join("\n");
  const sdBullets = sd?.bullets?.join("\n") ?? "";
  const slBullets = sl?.bullets?.join("\n") ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Homepage composition</h1>
      <p className="mt-3 rounded-lg border border-washed-denim/25 bg-washed-denim/10 px-4 py-3 font-body text-sm leading-relaxed text-deep-soil/85">
        <strong className="text-deep-soil">Public site:</strong> the homepage merges the Kelly Grappe command-center
        blueprint <em>with</em> the full narrative blocks from the original build (heard / movement / pathways / splits /
        Arkansas band / editorial / blog / trail / quote). Use the section checklist to show or hide those blocks.
        Hero, quote band, splits, and final CTA copy are edited below.
      </p>
      <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
        Changes merge with static defaults in code—empty fields fall back safely. Use the checkboxes below to show or
        hide each block; the textarea is the legacy id list (reference for ordering ids).
      </p>
      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-field-green/35 bg-field-green/10 px-3 py-2 font-body text-sm text-deep-soil">
          Saved. Public homepage revalidated.
        </p>
      ) : null}

      <form action={saveHomepageAction} className="mt-8 space-y-10">
        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">Hero</legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Eyebrow</span>
            <input
              name="hero_eyebrow"
              defaultValue={hero.eyebrow}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block md:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title (before accent)</span>
              <input
                name="hero_title_before"
                defaultValue={hero.titleBefore}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Accent (red)</span>
              <input
                name="hero_title_accent"
                defaultValue={hero.titleAccent}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title (final line)</span>
              <input
                name="hero_title_after"
                defaultValue={hero.titleAfter}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Subtitle</span>
            <textarea
              name="hero_subtitle"
              rows={4}
              defaultValue={hero.subtitle}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Primary CTA label</span>
              <input
                name="hero_cta_primary_label"
                defaultValue={hero.ctaPrimaryLabel}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Primary CTA href</span>
              <input
                name="hero_cta_primary_href"
                defaultValue={hero.ctaPrimaryHref}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Secondary CTA label</span>
              <input
                name="hero_cta_secondary_label"
                defaultValue={hero.ctaSecondaryLabel}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Secondary CTA href</span>
              <input
                name="hero_cta_secondary_href"
                defaultValue={hero.ctaSecondaryHref}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">Sections</legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Order (one id per line)</span>
            <textarea
              name="section_order"
              rows={6}
              defaultValue={sectionOrderText}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-xs"
            />
          </label>
          <p className="font-body text-xs text-deep-soil/55">Ids: {HOMEPAGE_SECTION_IDS.join(", ")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {HOMEPAGE_SECTION_IDS.map((id) => {
              const hit = sectionOrder.find((s) => s.id === id);
              const enabled = hit ? hit.enabled : true;
              return (
                <label key={id} className="flex items-center gap-2 font-body text-sm">
                  <input type="checkbox" name={`sec_${id}`} defaultChecked={enabled} className="h-4 w-4 rounded border-deep-soil/30" />
                  <span>{id}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">Featured slugs</legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Story slugs (comma-separated)</span>
            <input
              name="featured_story_slugs"
              defaultValue={merged.featuredStorySlugs.join(", ")}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Editorial slugs (homepage rail)</span>
            <input
              name="featured_editorial_slugs"
              defaultValue={merged.featuredEditorialSlugs.join(", ")}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Notebook / Substack slugs</span>
            <input
              name="featured_synced_slugs"
              defaultValue={merged.featuredSyncedPostSlugs.join(", ")}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Explainer slugs</span>
            <input
              name="featured_explainer_slugs"
              defaultValue={merged.featuredExplainerSlugs.join(", ")}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">
              Featured homepage video — inbound row id (YouTube)
            </span>
            <input
              name="featured_homepage_video_inbound_id"
              defaultValue={merged.featuredHomepageVideoInboundId ?? ""}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
              placeholder="cuid from Admin → Inbox (YouTube item)"
            />
            <span className="mt-1 block font-body text-xs text-deep-soil/55">
              Optional. When set, homepage + /watch hero prefer this curated clip. Leave empty to fall back to a featured
              or latest reviewed YouTube inbound row.
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">Direct democracy band (visual column)</legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Kicker</span>
            <input name="sd_kicker" defaultValue={sd?.kicker ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
            <input name="sd_title" defaultValue={sd?.title ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Body</span>
            <textarea name="sd_body" rows={3} defaultValue={sd?.body ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Bullets (one per line)</span>
            <textarea name="sd_bullets" rows={4} defaultValue={sdBullets} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-xs" />
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">
            Secondary feature band (visual column · homepage section <code className="text-xs">labor</code>)
          </legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Kicker</span>
            <input name="sl_kicker" defaultValue={sl?.kicker ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
            <input name="sl_title" defaultValue={sl?.title ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Body</span>
            <textarea name="sl_body" rows={3} defaultValue={sl?.body ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Card lines (one per line)</span>
            <textarea name="sl_bullets" rows={4} defaultValue={slBullets} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-xs" />
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">Arkansas band</legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Intro paragraph</span>
            <textarea name="ark_intro" rows={3} defaultValue={ab?.intro ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Quote</span>
            <textarea name="ark_quote" rows={2} defaultValue={ab?.quote ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Attribution</span>
            <input name="ark_attr" defaultValue={ab?.attribution ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">Quote band</legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Quote</span>
            <textarea name="quote_text" rows={3} defaultValue={quoteBand.quote} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Attribution</span>
            <input name="quote_attr" defaultValue={quoteBand.attribution} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
          <legend className="font-heading text-lg font-bold text-deep-soil">Final CTA</legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Eyebrow</span>
            <input name="final_eyebrow" defaultValue={finalCta.eyebrow} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
            <input name="final_title" defaultValue={finalCta.title} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Description</span>
            <textarea name="final_description" rows={3} defaultValue={finalCta.description} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Primary label</span>
              <input name="final_primary_label" defaultValue={finalCta.primaryLabel} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Primary href</span>
              <input name="final_primary_href" defaultValue={finalCta.primaryHref} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Secondary label</span>
              <input name="final_secondary_label" defaultValue={finalCta.secondaryLabel} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Secondary href</span>
              <input name="final_secondary_href" defaultValue={finalCta.secondaryHref} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded-btn bg-red-dirt px-6 py-3 font-body text-sm font-bold text-cream-canvas shadow-soft hover:bg-[#8f3d24]"
        >
          Save homepage
        </button>
      </form>
    </div>
  );
}
