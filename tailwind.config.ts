import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./component/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: "#059669",
          emeraldDark: "#047857",
          ink: "#0f172a",
          slate: "#1e293b",
          ivory: "#f8fafc",
        },
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 25px 55px -20px rgba(5, 150, 105, 0.25)",
        outline: "0 0 0 4px rgba(5, 150, 105, 0.12)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at top right, rgba(5, 150, 105, 0.35), transparent 55%), radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.25), transparent 60%)",
      },
      borderRadius: {
        pill: "9999px",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
