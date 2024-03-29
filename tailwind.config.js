/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ttf,html,ts,js,tsx,jsx,wav,mp3}'],
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: 'tw-',
  safelist: [
    'tw-bg-transparent',
    {
      pattern: /tw-box-(content|border)/
    },
    {
      pattern: /tw-(bg|border)-(blue|sky|green|pink|yellow|orange|violet)-(300|400|500|600|700|800|900)/
    },
    {
      pattern: /tw-(h|w)-(20|24|28|32|36|40)/
    },
    {
      pattern: /tw-p(b|t)-(2|4|6|8|10|12|16)/
    }
  ],
  corePlugins: {
    preflight: false
  }
}
