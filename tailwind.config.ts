import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kids: {
          pink: "#FF6B9D",
          blue: "#4ECDC4",
          yellow: "#FFE66D",
          purple: "#A855F7",
          orange: "#FF8C42",
          green: "#6BCB77",
          red: "#FF6B6B",
          dark: "#2D2B55",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;