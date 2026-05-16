import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: "#fef7ed",
          card: "#ffffff",
          border: "#f5d0a9",
          accent: "#b45309",
          text: "#78350f",
          muted: "#92400e",
          link: "#d97706",
        },
      },
      borderRadius: {
        card: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
