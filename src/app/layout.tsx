import type { Metadata, Viewport } from "next";
import { League_Spartan, Raleway } from "next/font/google";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { siteConfig } from "@/config/site";
import "./globals.css";

/** Inline bootstrap: default light; respects `reddirt-theme` before React hydrates (no flash). */
const THEME_BOOTSTRAP = `
(function(){
  try {
    var v = localStorage.getItem('reddirt-theme');
    var d = document.documentElement;
    if (v === 'dark') d.classList.add('dark');
    else if (v === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) d.classList.add('dark');
  } catch (e) {}
})();
`;

/** Primary bold headings — official brand card (all-caps stack / display) */
const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

/** Secondary / body / UI — official brand card */
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${leagueSpartan.variable} ${raleway.variable}`}>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <ThemeProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
