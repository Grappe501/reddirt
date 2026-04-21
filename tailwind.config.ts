import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "red-dirt": "var(--color-primary)",
        "deep-soil": "var(--color-text-primary)",
        "cream-canvas": "var(--color-bg)",
        "washed-denim": "var(--color-secondary)",
        "field-green": "var(--color-success)",
        "sunlight-gold": "var(--color-accent)",
        "civic-midnight": "var(--civic-midnight)",
        "civic-deep": "var(--civic-deep)",
        "civic-blue": "var(--civic-blue)",
        "civic-slate": "var(--civic-slate)",
        "civic-gold": "var(--civic-gold)",
        "civic-gold-soft": "var(--civic-gold-soft)",
        "civic-mist": "var(--civic-mist)",
        "civic-fog": "var(--civic-fog)",
        "civic-ink": "var(--civic-ink)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "var(--max-content-width)",
      },
      spacing: {
        "section-y": "var(--section-padding-y)",
        "section-y-lg": "var(--section-padding-y-lg)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
      borderRadius: {
        btn: "8px",
        card: "12px",
      },
      screens: {
        xs: "400px",
        "3xl": "1800px",
      },
    },
  },
  plugins: [],
};

export default config;
