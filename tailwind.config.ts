import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Custom keys used in components
        base: "var(--background)",
        surface: {
          DEFAULT: "var(--card)",
          elevated: "var(--muted)",
          high: "var(--accent)",
        },
        "text-primary": "var(--foreground)",
        "text-secondary": "var(--muted-foreground)",
        "text-muted": "var(--muted-foreground)",
        "border-subtle": "var(--border)",
        "border-default": "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        milestoneComplete: {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(245,158,11,0)" },
          "50%": { transform: "scale(1.2)", boxShadow: "0 0 20px rgba(245,158,11,0.5)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(245,158,11,0)" },
        },
        fundRelease: {
          "0%": { width: "0%", backgroundColor: "#6366f1" },
          "100%": { width: "100%", backgroundColor: "#ea580c" },
        },
        spinRing: {
          "0%": { transform: "rotate(0deg)", borderTopColor: "#6366f1" },
          "100%": { transform: "rotate(360deg)", borderTopColor: "#6366f1" },
        },
        bob1: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        bob2: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        bob3: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        milestoneComplete: "milestoneComplete 0.5s ease-out",
        fundRelease: "fundRelease 2s ease-in-out forwards",
        spinRing: "spinRing 1s linear infinite",
        bob1: "bob1 3s ease-in-out infinite",
        bob2: "bob2 4s ease-in-out infinite",
        bob3: "bob3 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

