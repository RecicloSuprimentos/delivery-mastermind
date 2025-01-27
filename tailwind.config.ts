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
        'xs': '0.68rem',    // Original 0.75rem
        'sm': '0.77rem',    // Original 0.875rem
        'base': '0.9rem',   // Original 1rem
        'lg': '1rem',       // Original 1.125rem
        'xl': '1.125rem',   // Original 1.25rem
        '2xl': '1.35rem',   // Original 1.5rem
        '3xl': '1.8rem',    // Original 2rem
        '4xl': '2.25rem',   // Original 2.5rem
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
  plugins: [
    require("tailwindcss-animate"),
    require('tailwind-scrollbar')
  ],
} satisfies Config;