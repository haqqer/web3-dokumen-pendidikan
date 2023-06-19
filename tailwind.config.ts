import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}","./node_modules/tailwind-datepicker-react/dist/**/*.js",],
  theme: {
    extend: {},
  },
  plugins: [
  ],
} satisfies Config;
