import type { Config } from "tailwindcss";

export default {
  presets: [require("@vapc/config/tailwind")],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
} satisfies Config;
