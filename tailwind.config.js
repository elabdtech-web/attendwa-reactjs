/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#41E975",
        secondary: "#35d373",
      },
    },
    screens: {
      xsm: "400px",
      base: "500px",
      sm: "640px",
      md: "768px",
      lg: "900px",
      lg2: "1024px",
      xl: "1200px",
    },
  },
  plugins: [],
};
