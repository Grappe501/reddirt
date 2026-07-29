import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        "kelly-subtle": "var(--text-subtle-on-light)",
        "kelly-inverse": "var(--text-on-navy)",
        "kelly-inverse-muted": "var(--text-subtle-on-navy)",
        "kelly-inverse-soft": "var(--text-soft-on-navy)",
        "kelly-border": "var(--border-ui)",
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
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
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
        "seminar-reveal": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "seminar-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(202, 145, 61, 0)" },
          "50%": { boxShadow: "0 0 28px 2px rgba(202, 145, 61, 0.22)" },
        },
        "moot-pulse": {
          "0%, 100%": { borderColor: "rgba(192, 38, 211, 0.35)" },
          "50%": { borderColor: "rgba(192, 38, 211, 0.85)" },
        },
      },
      animation: {
        "wow-drift": "wow-drift 32s ease-in-out infinite",
        "wow-drift-slow": "wow-drift-slow 18s ease-in-out infinite",
        "seminar-reveal": "seminar-reveal 0.55s ease-out forwards",
        "seminar-glow": "seminar-glow 4s ease-in-out infinite",
        "moot-pulse": "moot-pulse 2.8s ease-in-out infinite",
      },
      backgroundImage: {
        "seminar-hall": "linear-gradient(135deg, #000066 0%, #1a1a5e 42%, #2d1b4e 100%)",
        "seminar-gold-rule": "linear-gradient(90deg, transparent, #ca913d 20%, #ca913d 80%, transparent)",
        "office-hours-warm": "linear-gradient(160deg, #faf5ff 0%, #fff7ed 55%, #fef3c7 100%)",
        "moot-court-bench": "linear-gradient(180deg, #fdf4ff 0%, #f5f3ff 50%, #ede9fe 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
