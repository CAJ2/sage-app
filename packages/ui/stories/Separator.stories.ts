import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Separator from '../app/components/separator/Separator.vue'

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    orientation: 'horizontal',
  },
}

export default meta
type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => ({
    components: { Separator },
    setup() {
      return { args }
    },
    template: `
      <div class="w-64">
        <p class="text-sm">Above the separator</p>
        <Separator v-bind="args" class="my-4" />
        <p class="text-sm">Below the separator</p>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: { Separator },
    setup() {
      return { args }
    },
    template: `
      <div class="flex h-12 items-center gap-4">
        <span class="text-sm">Left</span>
        <Separator v-bind="args" />
        <span class="text-sm">Right</span>
      </div>
    `,
  }),
}
