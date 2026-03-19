import type { Meta, StoryObj } from '@nuxtjs/storybook'

import TextArea from '../app/components/form/TextArea.vue'

const meta: Meta<typeof TextArea> = {
  title: 'Forms/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text' },
    defaultValue: { control: 'text' },
  },
  args: {},
}
export default meta
type Story = StoryObj<typeof TextArea>

export const Default: Story = {
  render: () => ({
    components: { TextArea },
    template: '<div class="w-80"><TextArea placeholder="Enter text..." /></div>',
  }),
}

export const WithValue: Story = {
  args: { defaultValue: 'This is some pre-filled content in the text area.' },
  render: (args) => ({
    components: { TextArea },
    setup() {
      return { args }
    },
    template: '<div class="w-80"><TextArea v-bind="args" /></div>',
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { TextArea },
    template: '<div class="w-80"><TextArea disabled placeholder="Disabled textarea" /></div>',
  }),
}
