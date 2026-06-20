import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class", ".dark, .moss-dark, .pond-dark, .kingdom-dark"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        // Custom design tokens mapping
        brand: {
          bg: {
            primary: "hsl(var(--bg-primary))",
            secondary: "hsl(var(--bg-secondary))"
          },
          surface: {
            DEFAULT: "hsl(var(--surface))",
            hover: "hsl(var(--surface-hover))"
          },
          border: "hsl(var(--border))",
          text: {
            primary: "hsl(var(--text-primary))",
            secondary: "hsl(var(--text-secondary))"
          },
          accent: {
            DEFAULT: "hsl(var(--accent-brand))",
            hover: "hsl(var(--accent-hover-brand))"
          },
          danger: "hsl(var(--danger-brand))",
          success: "hsl(var(--success-brand))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glow: "0 24px 80px var(--glow-color)"
      }
    }
  },
  plugins: [animate]
};

export default config;
