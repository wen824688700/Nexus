import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 赛博朋克颜色
        cyber: {
          dark: '#0a0a0f',
          cyan: '#00f3ff',
          magenta: '#ff00ff',
          purple: '#7000ff',
        },
        neon: {
          cyan: '#00f3ff',
          magenta: '#ff00ff',
          purple: '#7000ff',
        },
        // 保留原有颜色以兼容现有组件
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron-var)', 'sans-serif'],
        inter: ['var(--font-sans-var)', 'sans-serif'],
        mono: ['var(--font-mono-var)', 'monospace'],
        display: ['var(--font-display-var)', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.5), 0 0 40px rgba(0, 243, 255, 0.3)',
        'neon-magenta': '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(112, 0, 255, 0.5), 0 0 40px rgba(112, 0, 255, 0.3)',
        'glow-cyan': '0 0 10px rgba(0, 243, 255, 0.8), 0 0 20px rgba(0, 243, 255, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", boxShadow: "0 0 20px rgba(0, 243, 255, 0.3)" },
          "50%": { opacity: "1", boxShadow: "0 0 40px rgba(0, 243, 255, 0.8)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "grid-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px #00f3ff, 0 0 10px #00f3ff" },
          "50%": { boxShadow: "0 0 20px #00f3ff, 0 0 40px #00f3ff" },
        },
        "border-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "typewriter": {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "news-scroll": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        "led-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "led-flow-reverse": {
          "0%": { backgroundPosition: "200% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "led-flow-vertical": {
          "0%": { backgroundPosition: "50% 0%" },
          "100%": { backgroundPosition: "50% 200%" },
        },
        "led-flow-vertical-reverse": {
          "0%": { backgroundPosition: "50% 200%" },
          "100%": { backgroundPosition: "50% 0%" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "grid-rotate": "grid-rotate 60s linear infinite",
        "scan-line": "scan-line 4s linear infinite",
        "glitch": "glitch 0.3s ease-in-out",
        "shimmer": "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "border-flow": "border-flow 4s ease infinite",
        "typewriter": "typewriter 2s steps(40) forwards",
        "blink": "blink 0.7s infinite",
        "news-scroll": "news-scroll 20s linear infinite",
        "led-flow": "led-flow 3s linear infinite",
        "led-flow-reverse": "led-flow-reverse 3s linear infinite",
        "led-flow-vertical": "led-flow-vertical 3s linear infinite",
        "led-flow-vertical-reverse": "led-flow-vertical-reverse 3s linear infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "spin-slow": "spin-slow 3s linear infinite",
        "spin-reverse": "spin-reverse 2s linear infinite",
        "loading-bar": "loading-bar 1.5s ease-in-out infinite",
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00f3ff, #ff00ff, #7000ff, #00f3ff)',
        'grid-pattern': 'linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)',
      },
      transitionTimingFunction: {
        'cyber': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'glitch': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};

export default config;
