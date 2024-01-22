/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,js,tsx,jsx}'],
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
    }
  ],
  corePlugins: {
    preflight: false
  }
}
