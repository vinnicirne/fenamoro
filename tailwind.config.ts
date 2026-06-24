import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── FéNamoro Design System ────────────────────────────────
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],         // Cabeçalhos imponentes
        jakarta: ["Plus Jakarta Sans", "sans-serif"], // UI, botões
        manrope: ["Manrope", "sans-serif"],       // Leitura, testemunhos
      },
      colors: {
        // Paleta WhatsApp (premium-gradient)
        whatsapp: {
          green:    "#25D366",   // CTA primário
          teal:     "#128C7E",   // Header, bolhas enviadas
          darkTeal: "#075E54",   // Gradient inicio
          light:    "#F0F2F5",   // Background discovery
          chatLight:"#EFEAE2",   // Background chat
          dark:     "#111B21",   // Dark mode base
          darkMid:  "#202C33",   // Cards dark
          darkCard: "#2A3942",   // Surface elevated dark
        },
        // Fé tones
        fe: {
          gold:    "#F59E0B",    // Selos, destaque fé
          rose:    "#E11D48",    // Rejeição, denúncia
          dove:    "#F8FAFC",    // Branco pomba
          spirit:  "#7C3AED",    // Acento espiritual
        },
        // Semântica
        match:   "#25D366",
        reject:  "#E11D48",
        super:   "#F59E0B",
        verified:"#128C7E",
      },
      backgroundImage: {
        // O gradiente premium do match/header
        "premium-gradient": "linear-gradient(135deg, #075E54 0%, #128C7E 100%)",
        "match-gradient":   "linear-gradient(180deg, #075E54 0%, #0a1628 100%)",
        "card-gradient":    "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)",
        "whatsapp-pattern": "url('/images/chat-pattern.png')",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "glass":   "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
        "premium": "0 20px 60px rgba(7,94,84,0.3)",
        "card":    "0 4px 24px rgba(0,0,0,0.12)",
        "glow-green": "0 0 30px rgba(37,211,102,0.3)",
        "glow-match": "0 0 60px rgba(7,94,84,0.5)",
      },
      animation: {
        "float":      "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "ring":       "ring 1.5s ease-out forwards",
        "slide-up":   "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in":    "fadeIn 0.3s ease-out",
        "heart-pop":  "heartPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        ring: {
          "0%":   { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        heartPop: {
          "0%":   { transform: "scale(0)" },
          "70%":  { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
