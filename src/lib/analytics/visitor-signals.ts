export type DeviceClass = "phone" | "tablet" | "desktop" | "unknown";

export type ContentSectionId =
  | "home"
  | "from_the_road"
  | "events"
  | "get_involved"
  | "donate"
  | "about"
  | "office"
  | "counties"
  | "voter_registration"
  | "direct_democracy"
  | "stories"
  | "other";

export const CONTENT_SECTION_LABELS: Record<ContentSectionId, string> = {
  home: "Home",
  from_the_road: "From the Road",
  events: "Events",
  get_involved: "Get involved",
  donate: "Donate",
  about: "About Kelly",
  office: "The office",
  counties: "County pages",
  voter_registration: "Voter registration",
  direct_democracy: "Direct democracy",
  stories: "Stories",
  other: "Other pages",
};

const COUNTY_PATH = /^\/(?:counties|organizing-intelligence\/counties)\/([a-z0-9-]+)/i;

export function classifyDeviceFromUserAgent(ua: string | null | undefined): DeviceClass {
  const raw = (ua ?? "").trim();
  if (!raw) return "unknown";
  if (/iPad|Tablet|PlayBook|Silk/i.test(raw) && !/Mobile.*Safari/i.test(raw)) return "tablet";
  if (/Android(?!.*Mobile)|Tablet/i.test(raw)) return "tablet";
  if (/Mobi|iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile/i.test(raw)) return "phone";
  if (/Mozilla|Chrome|Safari|Firefox|Edg|OPR/i.test(raw)) return "desktop";
  return "unknown";
}

export function classifyViewport(width: number | null | undefined): DeviceClass {
  if (!width || width < 1) return "unknown";
  if (width < 768) return "phone";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function sanitizeLocale(raw: string | null | undefined): string | undefined {
  const text = (raw ?? "").trim();
  if (!/^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(text)) return undefined;
  return text.slice(0, 8);
}

export function sanitizeTimezone(raw: string | null | undefined): string | undefined {
  const text = (raw ?? "").trim();
  if (text === "UTC" || text === "GMT") return text;
  if (!/^[A-Za-z]+(?:[_-][A-Za-z]+)*(?:\/[A-Za-z0-9_+-]+)+$/.test(text)) return undefined;
  return text.slice(0, 64);
}

export function sanitizeReferrerHost(raw: string | null | undefined): string | undefined {
  const text = (raw ?? "").trim().toLowerCase().replace(/^www\./, "");
  if (!text || /^\d{1,3}(\.\d{1,3}){3}$/.test(text)) return undefined;
  if (!/^[a-z0-9][a-z0-9.-]{0,80}\.[a-z]{2,24}$/.test(text)) return undefined;
  return text.slice(0, 80);
}

/** Research / staff tools hosted on the same app — do not mix into campaign visitor totals. */
export function isCampaignAnalyticsPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("/admin") || path.startsWith("/api")) return false;
  if (path.startsWith("/fec-max-donors") || path.startsWith("/fec-donors")) return false;
  return true;
}

export function classifyContentSection(path: string): ContentSectionId {
  if (path === "/") return "home";
  if (path === "/from-the-road" || path.startsWith("/from-the-road/")) return "from_the_road";
  if (path === "/events" || path.startsWith("/events/")) return "events";
  if (path === "/get-involved" || path.startsWith("/get-involved/") || path.startsWith("/volunteer")) {
    return "get_involved";
  }
  if (path === "/donate" || path.startsWith("/donate/")) return "donate";
  if (path === "/about" || path.startsWith("/about/")) return "about";
  if (path === "/office" || path.startsWith("/office/")) return "office";
  if (path.startsWith("/counties") || path.startsWith("/organizing-intelligence/counties/")) return "counties";
  if (path === "/voter-registration" || path.startsWith("/voter-registration/")) return "voter_registration";
  if (path === "/direct-democracy" || path.startsWith("/direct-democracy/")) return "direct_democracy";
  if (path === "/stories" || path.startsWith("/stories/") || path.startsWith("/blog")) return "stories";
  return "other";
}

export function countySlugFromPath(path: string): string | null {
  const match = path.match(COUNTY_PATH);
  const slug = match?.[1]?.toLowerCase() ?? "";
  if (!slug || slug === "page") return null;
  return slug.slice(0, 80);
}

export function isPublicConversionHref(href: string | null | undefined): boolean {
  const raw = (href ?? "").trim();
  if (!raw) return false;
  if (/goodchange\.app/i.test(raw)) return true;
  try {
    const path = raw.startsWith("http") ? new URL(raw).pathname : raw.split("?")[0] ?? "";
    return (
      path === "/donate" ||
      path.startsWith("/donate/") ||
      path === "/get-involved" ||
      path.startsWith("/get-involved/") ||
      path.startsWith("/volunteer") ||
      path === "/events/request" ||
      path === "/voter-registration" ||
      path.startsWith("/voter-registration/")
    );
  } catch {
    return false;
  }
}
