/** @type {import('tailwindcss').Config} */

module.exports = {
  purge: ["./src/**/*.{html, js,jsx,ts,tsx}", "./public/index.html"],
  content: ["./src/**/*.{html, ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#155883",
        secondary: "#3493cf",
        lightprimary: "#f1fafe",
      },
      screens: {
        'hd': '1280px',
        "wxga": '1440px',
        "uxga": "1600px",
        "fhd": "1920px",
      },
      fontSize: {
        xxs: "0.625rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};