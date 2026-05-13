import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "kelly-calendar",
    name: "Kelly Calendar",
    short_name: "Kelly Calendar",
    description: "Kelly Grappe campaign calendar cockpit (authenticated).",
    start_url: "/kelly/calendar",
    scope: "/kelly/",
    display: "standalone",
    background_color: "#1a120c",
    theme_color: "#1a120c",
    orientation: "portrait-primary",
    icons: [{ src: "/favicon.ico", sizes: "64x64", type: "image/x-icon", purpose: "any" }],
  };
}
