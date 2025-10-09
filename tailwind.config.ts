import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // all files in app router
    "./component/**/*.{js,ts,jsx,tsx,mdx}", // your Header lives here
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // if you add any pages folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
