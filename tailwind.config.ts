import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "var(--canvas)",
        "canvas-subtle": "var(--canvas-subtle)",
        surface: "var(--surface)",
        "surface-green": "var(--surface-green)",
        "forest-950": "var(--forest-950)",
        "forest-900": "var(--forest-900)",
        "forest-700": "var(--forest-700)",
        "green-500": "var(--green-500)",
        "green-100": "var(--green-100)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        border: "var(--border)",
        blue: "var(--blue)",
        teal: "var(--teal)",
        amber: "var(--amber)",
        coral: "var(--coral)",
        danger: "var(--danger)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        content: "1240px",
      },
      minHeight: {
        touch: "44px",
      },
      width: {
        sidebar: "248px",
      },
      margin: {
        sidebar: "248px",
      },
    },
  },
  plugins: [],
};

export default config;
