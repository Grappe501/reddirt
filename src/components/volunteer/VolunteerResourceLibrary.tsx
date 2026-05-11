import Link from "next/link";

import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { getResourceRequestMailtoHref } from "@/lib/campaign-links";
import { isExternalHref } from "@/lib/href";
import {
  isPdfOrFileDownloadHref,
  publicationStatusBadgeClass,
  presentVolunteerResource,
} from "@/lib/volunteer-resource-publication";
import type { VolunteerResource } from "@/lib/volunteer-resources";
import { getVolunteerResourcesByCategory, VOLUNTEER_RESOURCE_CATEGORIES } from "@/lib/volunteer-resources";

function ResourceRow({ resource }: { resource: VolunteerResource }) {
  const pres = presentVolunteerResource(resource);
  const isDownloadAsset = isPdfOrFileDownloadHref(resource.href, resource.fileType);
  const statusBadge = (
    <span
      className={`rounded-md border px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${publicationStatusBadgeClass(pres.status)}`}
      title="Campaign release status"
    >
      {pres.statusLabel}
    </span>
  );
  const typeBadge = (
    <span className="rounded-full bg-kelly-text/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/70">
      {resource.fileType ?? "Resource"}
    </span>
  );

  const meta =
    resource.fileSize && pres.allowDirectFileDownload ? (
      <span className="font-body text-xs text-kelly-text/55">{resource.fileSize}</span>
    ) : null;

  const body = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-heading text-base font-bold text-kelly-navy group-hover:text-kelly-blue">{resource.title}</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {meta}
          {statusBadge}
          {typeBadge}
        </div>
      </div>
      <div className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">
        {resource.comingSoon && isDownloadAsset ? (
          <p className="mb-1 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
            Expected purpose · campaign review required before download
          </p>
        ) : null}
        {resource.description}
      </div>
      {pres.downloadNote ? (
        <p className="mt-1.5 font-body text-[11px] text-kelly-text/60">{pres.downloadNote}</p>
      ) : null}
      {pres.reviewNote ? (
        <p className="mt-2 rounded-lg border border-kelly-gold/35 bg-kelly-gold/[0.08] px-3 py-2 font-body text-xs font-medium text-kelly-deep">
          {pres.reviewNote}
        </p>
      ) : null}
      {!pres.allowDirectFileDownload && resource.fileType === "PDF" ? (
        <p className="mt-2 font-mono text-[10px] leading-snug text-kelly-text/40">Planned file: {resource.href}</p>
      ) : null}
    </>
  );

  const cardClass =
    "group rounded-xl border border-kelly-text/10 bg-white px-4 py-4 shadow-[var(--shadow-soft)] transition md:px-5 md:py-5 print:break-inside-avoid";

  if (pres.allowDirectFileDownload) {
    if (isExternalHref(resource.href)) {
      return (
        <a
          href={resource.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cardClass} block hover:border-kelly-navy/25`}
        >
          {body}
        </a>
      );
    }
    return (
      <a href={resource.href} className={`${cardClass} block hover:border-kelly-navy/25`}>
        {body}
      </a>
    );
  }

  const blockedPdf =
    resource.fileType === "PDF" || /\.pdf(\?|$)/i.test(resource.href);
  if (blockedPdf) {
    return <div className={`${cardClass} cursor-default`}>{body}</div>;
  }

  if (isExternalHref(resource.href)) {
    return (
      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClass} block hover:border-kelly-navy/25`}
      >
        {body}
      </a>
    );
  }
  return (
    <Link href={resource.href} className={`${cardClass} block hover:border-kelly-navy/25`}>
      {body}
    </Link>
  );
}

function ResourceLibraryIntro() {
  return (
    <FullBleedSection padY variant="subtle" aria-labelledby="resource-quality-heading">
      <ContentContainer className="max-w-3xl">
        <div className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] px-5 py-6 md:px-8 md:py-7">
          <h2 id="resource-quality-heading" className="font-heading text-lg font-bold text-kelly-navy md:text-xl">
            Resource quality & downloads
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
            Printable files and polished downloads go through campaign review before they are released. Web guides (field
            playbook, email shells) can update continuously. Every card shows a{" "}
            <span className="font-semibold text-kelly-deep">status</span> so nothing rough ships as “final.”
          </p>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 font-body text-sm text-kelly-text/85">
            <li>Content drafted</li>
            <li>Visual mockup created</li>
            <li>Reviewed by campaign</li>
            <li>Revised</li>
            <li>Approved</li>
            <li>Published (downloads only when truly ready)</li>
          </ol>
          <p className="mt-4 font-body text-sm font-semibold text-kelly-deep">
            Download coming after campaign review — applies to any PDF or handout not yet Published.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/volunteer/resources/glossary"
              className="inline-flex rounded-lg border border-kelly-navy/25 bg-white px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              Glossary
            </Link>
            <Link
              href="/volunteer/resources/faq"
              className="inline-flex rounded-lg border border-kelly-navy/25 bg-white px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              FAQ for new volunteers
            </Link>
          </div>
        </div>
      </ContentContainer>
    </FullBleedSection>
  );
}

export function VolunteerResourceLibrary() {
  const byCat = getVolunteerResourcesByCategory();

  return (
    <>
      <ResourceLibraryIntro />
      {VOLUNTEER_RESOURCE_CATEGORIES.map((cat, index) => {
        const items = byCat.get(cat.id) ?? [];
        const variant = index % 2 === 0 ? "default" : "subtle";
        return (
          <FullBleedSection
            key={cat.id}
            id={cat.id}
            variant={variant}
            padY
            aria-labelledby={`resource-cat-${cat.id}`}
            className="scroll-mt-24"
          >
            <ContentContainer className="max-w-3xl">
              <SectionHeading
                id={`resource-cat-${cat.id}`}
                align="left"
                eyebrow="Library"
                title={cat.title}
                subtitle={cat.description}
              />
              <div className="mt-8 flex flex-col gap-4">
                {items.map((r) => (
                  <ResourceRow key={r.id} resource={r} />
                ))}
              </div>
            </ContentContainer>
          </FullBleedSection>
        );
      })}

      <FullBleedSection padY aria-labelledby="resource-request-heading">
        <ContentContainer className="max-w-3xl">
          <div className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] px-6 py-8 md:px-10 md:py-10">
            <h2 id="resource-request-heading" className="font-heading text-xl font-bold text-kelly-navy md:text-2xl">
              Need something that isn’t here?
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85 md:text-base">
              We’re continually adding tools and materials. Requests go through the same review path before anything is
              published as a download.
            </p>
            <div className="mt-6">
              <a
                href={getResourceRequestMailtoHref()}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-btn bg-kelly-navy px-5 py-3 text-sm font-semibold tracking-wide text-kelly-white shadow-soft transition duration-normal hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
              >
                Request a resource
              </a>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
