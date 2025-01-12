import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        'xs': '0.675rem',    // 90% of 0.75rem
        'sm': '0.765rem',    // 90% of 0.85rem
        'base': '0.81rem',   // 90% of 0.9rem
        'lg': '0.9rem',      // 90% of 1rem
        'xl': '1.08rem',     // 90% of 1.2rem
        '2xl': '1.35rem',    // 90% of 1.5rem
        '3xl': '1.71rem',    // 90% of 1.9rem
        '4xl': '2.16rem',    // 90% of 2.4rem
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1A1F2C",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#403E43",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#dc3545",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#28a745",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F6F6F7",
          foreground: "#888888",
        },
        accent: {
          DEFAULT: "#2A2D35",
          foreground: "#FFFFFF",
        },
        soft: {
          green: "#F2FCE2",
          yellow: "#FEF7CD",
          purple: "#E5DEFF",
          pink: "#FFDEE2",
          peach: "#FDE1D3",
          blue: "#D3E4FD",
          gray: "#F1F0FB",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;