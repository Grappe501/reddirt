import type { Metadata } from "next";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { siteConfig } from "@/config/site";
import "./site-fonts.css";
import "./globals.css";

const macroscopicLifeSite =
  process.env.NEXT_PUBLIC_MACROSCOPIC_LIFE_SITE === "1" ||
  process.env.NEXT_PUBLIC_MACROSCOPIC_LIFE_SITE === "true" ||
  process.env.SITE_NAME === "macroscopic-life" ||
  process.env.NETLIFY_SITE_NAME === "macroscopic-life";

export const metadata: Metadata = {
  title: macroscopicLifeSite
    ? { default: "Macroscopic Life", template: "%s · Macroscopic Life" }
    : {
        default: siteConfig.name,
        template: `%s · ${siteConfig.name}`,
      },
  description: macroscopicLifeSite
    ? "Book One: What If We Are the Microbe? A reading instrument for nested scale, evidence, and a theory that can lose."
    : siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
