import type { StorybookConfig } from '@nuxtjs/storybook'

const config: StorybookConfig = {
  framework: {
    name: '@storybook-vue/nuxt',
    options: {},
  },
  stories: ['../src/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-themes', '@storybook/addon-docs'],
  staticDirs: ['../public'],
}

export default config
