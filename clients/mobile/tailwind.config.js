/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Custom color scheme matching web (dark theme with orange accent)
        border: "rgb(38 38 38)", // neutral-800
        input: "rgb(38 38 38)",
        ring: "rgb(251 146 60)", // orange-400
        background: "rgb(10 10 10)", // neutral-950
        foreground: "rgb(250 250 250)", // neutral-50
        primary: {
          DEFAULT: "rgb(234 88 12)", // orange-600
          foreground: "rgb(255 255 255)",
        },
        secondary: {
          DEFAULT: "rgb(38 38 38)", // neutral-800
          foreground: "rgb(250 250 250)",
        },
        destructive: {
          DEFAULT: "rgb(239 68 68)", // red-500
          foreground: "rgb(255 255 255)",
        },
        muted: {
          DEFAULT: "rgb(38 38 38)",
          foreground: "rgb(163 163 163)", // neutral-400
        },
        accent: {
          DEFAULT: "rgb(234 88 12)", // orange-600
          foreground: "rgb(255 255 255)",
        },
        card: {
          DEFAULT: "rgb(23 23 23)", // neutral-900
          foreground: "rgb(250 250 250)",
        },
        popover: {
          DEFAULT: "rgb(23 23 23)",
          foreground: "rgb(250 250 250)",
        },
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["Poppins_400Regular"],
        light: ["Poppins_300Light"],
        normal: ["Poppins_400Regular"],
        medium: ["Poppins_500Medium"],
        semibold: ["Poppins_600SemiBold"],
        bold: ["Poppins_700Bold"],
      },
    },
  },
  plugins: [],
};
