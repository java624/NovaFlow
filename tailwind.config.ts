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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Додаємо кастомні ключові кадри для анімації
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%) rotate(-20deg)" },
          "100%": { transform: "translateX(100%) rotate(-20deg)" },
        },
      },
      // Додаємо назву анімації, яку ти зможеш викликати через клас animate-shine
      animation: {
        shine: "shine 0.75s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
