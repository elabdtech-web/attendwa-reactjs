/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#20a078",
        secondary: "#35d373",
      },
    },
  },
  plugins: [],
};
