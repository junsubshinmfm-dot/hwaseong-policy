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
        card: "var(--card)",
        muted: "var(--muted)",
        navy: {
          DEFAULT: "#1A3B8F",
          light: "#2B55B2",
          dark: "#0D1F4D",
          50: "#EDF1FA",
          100: "#D0D9F0",
          200: "#A1B3E1",
          300: "#7290D2",
          400: "#4A6EC0",
          500: "#1A3B8F",
          600: "#152F73",
          700: "#102358",
          800: "#0B183C",
          900: "#060C21",
        },
        orange: {
          DEFAULT: "#F58220",
          light: "#F9A04E",
          dark: "#D06A10",
          50: "#FFF5EB",
          100: "#FFE4C7",
          200: "#FFCF9F",
          300: "#FFB976",
          400: "#F9A04E",
          500: "#F58220",
          600: "#D06A10",
          700: "#A8520A",
        },
        // 권역 색상 — 브랜드 블루/오렌지 기반 변형
        dongtan: "#2B6FD4",
        byeongjeom: "#E88544",
        manse: "#38A169",
        hyohaeng: "#7B5FBF",
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        'xs':   ['0.85rem', { lineHeight: '1.4' }],
        'sm':   ['0.95rem', { lineHeight: '1.5' }],
        'base': ['1.05rem', { lineHeight: '1.7' }],
        'lg':   ['1.2rem',  { lineHeight: '1.6' }],
        'xl':   ['1.35rem', { lineHeight: '1.5' }],
        '2xl':  ['1.6rem',  { lineHeight: '1.4' }],
        '3xl':  ['2rem',    { lineHeight: '1.3' }],
        '4xl':  ['2.5rem',  { lineHeight: '1.2' }],
        '5xl':  ['3.2rem',  { lineHeight: '1.1' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
export default config;
