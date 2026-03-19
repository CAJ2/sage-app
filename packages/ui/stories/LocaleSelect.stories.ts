import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'
import Drawer from '../app/components/drawer/Drawer.vue'
import DrawerContent from '../app/components/drawer/DrawerContent.vue'
import DrawerTrigger from '../app/components/drawer/DrawerTrigger.vue'
import LocaleSelect from '../app/components/settings/LocaleSelect.vue'

const meta: Meta<typeof LocaleSelect> = {
  title: 'Settings/LocaleSelect',
  component: LocaleSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A drawer-based locale selector. Displays a list of available locales with the currently selected one checked. Emits a `select` event with the chosen locale code. Typically rendered inside a Drawer.',
      },
    },
  },
  argTypes: {
    current: {
      control: 'select',
      options: ['en', 'de', 'fr', 'sv'],
    },
  },
  args: {
    current: 'en',
    locales: [
      { code: 'en', name: 'English' },
      // { code: 'de', name: 'Deutsch' },
      // { code: 'fr', name: 'Français' },
      { code: 'sv', name: 'Svenska' },
    ],
  },
}
export default meta
type Story = StoryObj<typeof LocaleSelect>

export const Default: Story = {
  render: (args) => ({
    components: { LocaleSelect, Drawer, DrawerTrigger, DrawerContent, Button },
    setup() {
      return { args }
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Select Language</Button>
        </DrawerTrigger>
        <DrawerContent>
          <LocaleSelect v-bind="args" @select="(code) => console.log('Selected:', code)" />
        </DrawerContent>
      </Drawer>
    `,
  }),
}

export const ManyLocales: Story = {
  args: {
    current: 'fr',
    locales: [
      { code: 'en', name: 'English' },
      // { code: 'de', name: 'Deutsch' },
      // { code: 'fr', name: 'Français' },
      { code: 'sv', name: 'Svenska' },
      // { code: 'es', name: 'Español' },
      // { code: 'pt', name: 'Português' },
      // { code: 'ja', name: '日本語' },
      // { code: 'zh', name: '中文' },
    ],
  },
  render: (args) => ({
    components: { LocaleSelect, Drawer, DrawerTrigger, DrawerContent, Button },
    setup() {
      return { args }
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Select Language (many)</Button>
        </DrawerTrigger>
        <DrawerContent>
          <LocaleSelect v-bind="args" @select="(code) => console.log('Selected:', code)" />
        </DrawerContent>
      </Drawer>
    `,
  }),
}
