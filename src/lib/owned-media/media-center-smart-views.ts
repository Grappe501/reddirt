import type { MediaLibraryListFilters } from "@/lib/media-library/types";

/**
 * Central map: sidebar / smart-view labels → `MediaLibraryListFilters` slices.
 * URL keys for the grid are owned by `page.tsx` / sidebar links — keep filter logic here only.
 */
export function filtersForSmartView(
  view:
    | "unreviewed_at"
    | "favorites"
    | "needs_press"
    | "needs_site"
    | "approved_press"
    | "approved_site"
    | "import_issues"
    | "derivatives_pending"
    | "video_no_transcript"
    | "low_rated_picks"
    | "reviewed_no_approvals"
    | "pick_queue"
): Partial<MediaLibraryListFilters> {
  switch (view) {
    case "unreviewed_at":
      return { isReviewed: false };
    case "favorites":
      return { isFavorite: true };
    case "needs_press":
      return { needsPressApproval: true };
    case "needs_site":
      return { needsPublicSiteApproval: true };
    case "approved_press":
      return { approvedForPress: true };
    case "approved_site":
      return { approvedForPublicSite: true };
    case "import_issues":
      return { hasImportIssueSignals: true };
    case "derivatives_pending":
      return { hasPendingDerivativeJobs: true };
    case "video_no_transcript":
      return { videoMissingTranscript: true };
    case "low_rated_picks":
      return { lowRatedPicks: true };
    case "reviewed_no_approvals":
      return { reviewedWithoutAnyApproval: true };
    case "pick_queue":
      return { isUnreviewed: true };
    default:
      return {};
  }
}

/** Query params used by `/admin/owned-media/grid` for smart views (single active key wins for aria-current). */
export type MediaCenterSmartViewParam =
  | "viewUnreviewed"
  | "viewFav"
  | "viewNeedPress"
  | "viewNeedSite"
  | "viewApPress"
  | "viewApSite"
  | "viewImport"
  | "viewDeriv"
  | "viewVidNoTr"
  | "viewLowPick"
  | "viewRevNoAp"
  | "viewPickQueue";

export function smartViewParamToFilters(param: MediaCenterSmartViewParam | undefined): Partial<MediaLibraryListFilters> {
  if (!param) return {};
  const map: Record<MediaCenterSmartViewParam, Partial<MediaLibraryListFilters>> = {
    viewUnreviewed: filtersForSmartView("unreviewed_at"),
    viewFav: filtersForSmartView("favorites"),
    viewNeedPress: filtersForSmartView("needs_press"),
    viewNeedSite: filtersForSmartView("needs_site"),
    viewApPress: filtersForSmartView("approved_press"),
    viewApSite: filtersForSmartView("approved_site"),
    viewImport: filtersForSmartView("import_issues"),
    viewDeriv: filtersForSmartView("derivatives_pending"),
    viewVidNoTr: filtersForSmartView("video_no_transcript"),
    viewLowPick: filtersForSmartView("low_rated_picks"),
    viewRevNoAp: filtersForSmartView("reviewed_no_approvals"),
    viewPickQueue: filtersForSmartView("pick_queue"),
  };
  return map[param] ?? {};
}

/** Strip these before applying a different smart view (only one active). */
export const MEDIA_CENTER_VIEW_QUERY_KEYS: MediaCenterSmartViewParam[] = [
  "viewUnreviewed",
  "viewFav",
  "viewNeedPress",
  "viewNeedSite",
  "viewApPress",
  "viewApSite",
  "viewImport",
  "viewDeriv",
  "viewVidNoTr",
  "viewLowPick",
  "viewRevNoAp",
  "viewPickQueue",
];

export function activeSmartViewFromQuery(sp: {
  viewUnreviewed?: string;
  viewFav?: string;
  viewNeedPress?: string;
  viewNeedSite?: string;
  viewApPress?: string;
  viewApSite?: string;
  viewImport?: string;
  viewDeriv?: string;
  viewVidNoTr?: string;
  viewLowPick?: string;
  viewRevNoAp?: string;
  viewPickQueue?: string;
}): { key: MediaCenterSmartViewParam; value: string } | undefined {
  const pairs: [MediaCenterSmartViewParam, string | undefined][] = [
    ["viewUnreviewed", sp.viewUnreviewed],
    ["viewFav", sp.viewFav],
    ["viewNeedPress", sp.viewNeedPress],
    ["viewNeedSite", sp.viewNeedSite],
    ["viewApPress", sp.viewApPress],
    ["viewApSite", sp.viewApSite],
    ["viewImport", sp.viewImport],
    ["viewDeriv", sp.viewDeriv],
    ["viewVidNoTr", sp.viewVidNoTr],
    ["viewLowPick", sp.viewLowPick],
    ["viewRevNoAp", sp.viewRevNoAp],
    ["viewPickQueue", sp.viewPickQueue],
  ];
  for (const [k, v] of pairs) {
    if (v === "1") return { key: k, value: "1" };
  }
  return undefined;
}
