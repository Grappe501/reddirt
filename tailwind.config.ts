import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/(site)/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "kelly-navy": "var(--kelly-official-navy)",
        "kelly-gold": "var(--kelly-official-gold)",
        "kelly-sky": "var(--kelly-official-sky)",
        "kelly-white": "var(--kelly-official-white)",
        "kelly-text": "var(--color-text-primary)",
        "kelly-page": "var(--color-bg)",
        "kelly-muted": "var(--color-secondary)",
        "kelly-success": "var(--color-success)",
        "kelly-wash": "var(--kelly-band-wash)",
        "kelly-deep": "var(--kelly-deep)",
        "kelly-blue": "var(--kelly-blue)",
        "kelly-slate": "var(--kelly-slate)",
        "kelly-gold-soft": "var(--kelly-gold-soft)",
        "kelly-mist": "var(--kelly-mist)",
        "kelly-fog": "var(--kelly-fog)",
        "kelly-ink": "var(--kelly-ink)",
        "kelly-copper": "var(--kelly-copper)",
        "kelly-copper-bright": "var(--kelly-copper-bright)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
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
      keyframes: {
        "wow-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(1.5%, -0.5%) scale(1.02)" },
          "66%": { transform: "translate(-0.5%, 1%) scale(0.99)" },
        },
        "wow-drift-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.75" },
        },
      },
      animation: {
        "wow-drift": "wow-drift 32s ease-in-out infinite",
        "wow-drift-slow": "wow-drift-slow 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
