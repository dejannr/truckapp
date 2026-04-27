import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        slatebase: "#f5f6f8",
        ink: "#12161f",
        accent: "#146ef5",
        ok: "#15803d",
        warn: "#b45309",
        bad: "#b91c1c"
      }
    }
  },
  plugins: []
};

export default config;
