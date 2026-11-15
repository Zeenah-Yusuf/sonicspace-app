/** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {
    fontFamily: {
      display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
      mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
    },
  } },
  plugins: [],
};