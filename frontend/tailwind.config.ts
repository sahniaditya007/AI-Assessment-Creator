import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#E6E6E6",
        primary: "#303030",
        secondary: "rgba(94, 94, 94, 0.8)",
        "secondary-muted": "rgba(94, 94, 94, 0.55)",
        "text-faded": "rgba(48, 48, 48, 0.6)",
        navy: "#011625",
        "navy-light": "#417BA4",
        disabled: "#A9A9A9",
        "bg-dark": "#5E5E5E",
        "bg-off-white": "#F6F6F6",
        "bg-off-white-20": "#F0F0F0",
        "border-muted": "#DADADA",
        "btn-primary": "#181818",
        "btn-dark-grey": "#2B2B2B",
        accent: "#FF5623",
        success: "#4BC26D",
        mint: "#17CB9E",
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "p-1": ["20px", { lineHeight: "140%", letterSpacing: "-0.04em" }],
        "p-3": ["16px", { lineHeight: "140%", letterSpacing: "-0.04em" }],
        "p-4": ["14px", { lineHeight: "140%", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        "4xl": "32px",
        pill: "100px",
      },
      boxShadow: {
        realistic:
          "0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)",
        card: "0px 20px 30px rgba(146, 146, 146, 0.19)",
      },
      maxWidth: {
        content: "1100px",
        form: "810px",
      },
    },
  },
  plugins: [],
};

export default config;
