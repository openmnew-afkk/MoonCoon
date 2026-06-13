import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        border: "var(--separator)",
        input: "var(--bg-tertiary)",
        ring: "var(--accent)",
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        primary: { DEFAULT: "var(--accent)", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "var(--bg-secondary)", foreground: "var(--text-primary)" },
        destructive: { DEFAULT: "#ff2a2a", foreground: "#FFFFFF" },
        muted: { DEFAULT: "var(--bg-tertiary)", foreground: "var(--text-secondary)" },
        accent: { DEFAULT: "var(--accent)", foreground: "#FFFFFF" },
        popover: { DEFAULT: "var(--bg-secondary)", foreground: "var(--text-primary)" },
        card: { DEFAULT: "var(--bg-card)", foreground: "var(--text-primary)" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "fade-up": "fade-up 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
