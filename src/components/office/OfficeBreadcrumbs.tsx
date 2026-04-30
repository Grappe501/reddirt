import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  type OfficeAreaSlug,
  officeLayerPath,
} from "@/content/office/office-three-layer";

type OfficeBreadcrumbsProps = {
  areaSlug: OfficeAreaSlug;
  areaShortTitle: string;
  layer: 1 | 2 | 3;
  className?: string;
};

const layerLabels: Record<2 | 3, string> = {
  2: "Why it matters",
  3: "Full picture",
};

export function OfficeBreadcrumbs({ areaSlug, areaShortTitle, layer, className }: OfficeBreadcrumbsProps) {
  const layer1Href = officeLayerPath(areaSlug, 1);

  return (
    <nav aria-label="Breadcrumb" className={cn("font-body text-sm text-kelly-text/75", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href="/understand" className="font-medium text-kelly-navy underline-offset-2 hover:underline">
            The Office
          </Link>
        </li>
        <li aria-hidden className="text-kelly-text/40">
          /
        </li>
        <li>
          {layer === 1 ? (
            <span className="font-semibold text-kelly-text">{areaShortTitle}</span>
          ) : (
            <Link href={layer1Href} className="font-medium text-kelly-navy underline-offset-2 hover:underline">
              {areaShortTitle}
            </Link>
          )}
        </li>
        {layer >= 2 ? (
          <>
            <li aria-hidden className="text-kelly-text/40">
              /
            </li>
            <li>
              {layer === 2 ? (
                <span className="font-semibold text-kelly-text">{layerLabels[2]}</span>
              ) : (
                <Link
                  href={officeLayerPath(areaSlug, 2)}
                  className="font-medium text-kelly-navy underline-offset-2 hover:underline"
                >
                  {layerLabels[2]}
                </Link>
              )}
            </li>
          </>
        ) : null}
        {layer === 3 ? (
          <>
            <li aria-hidden className="text-kelly-text/40">
              /
            </li>
            <li className="font-semibold text-kelly-text">{layerLabels[3]}</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}
