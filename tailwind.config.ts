import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base
        bg:      "#09090F",
        surface: "#0E1117",
        card:    "#12151F",
        "card-2":"#171B27",

        // Borders
        border:  "#1D2236",
        "border-2": "#283048",

        // Text
        text:      "#B8C4D8",
        "text-dim": "#546070",

        // Semantic — 红涨绿跌（中国惯例）
        up:         "#E03131",
        "up-dim":   "rgba(224,49,49,0.12)",
        "up-border":"rgba(224,49,49,0.35)",
        down:       "#2E9E5B",
        "down-dim": "rgba(46,158,91,0.12)",
        "down-border":"rgba(46,158,91,0.35)",

        // Accent
        gold:     "#C8941A",
        "gold-dim":"rgba(200,148,26,0.15)",
      },
      fontFamily: {
        mono: ["ui-monospace", "SF Mono", "Consolas", "Liberation Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
