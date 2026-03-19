import type { Preview } from '@nuxtjs/storybook'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { initialize, mswLoader } from 'msw-storybook-addon'

import '../app/assets/css/main.css'

// Initialize MSW
initialize()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  loaders: [mswLoader],
}

export default preview
