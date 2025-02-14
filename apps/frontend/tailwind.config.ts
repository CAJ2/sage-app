import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}
