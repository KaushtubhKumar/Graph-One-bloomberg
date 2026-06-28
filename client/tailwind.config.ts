import type { Config } from "tailwindcss";

// Tailwind v4: color/radius/shadow/font tokens live in app/globals.css via
// the @theme directive (the CSS-first config v4 prefers). This file only
// needs to declare content paths + darkMode strategy.
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
export default config;
