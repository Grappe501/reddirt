export type RoadVisualSource = "owned" | "substack" | "brand";

/** One image used in the sitewide “from the road” atmosphere strip. */
export type RoadVisual = {
  id: string;
  src: string;
  alt: string;
  /** Short line for AI / a11y (title, place, or caption). */
  label: string | null;
  countySlug: string | null;
  source: RoadVisualSource;
};
