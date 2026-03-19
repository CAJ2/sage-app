import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Input from '../app/components/form/Input.vue'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  render: () => ({
    components: { Input },
    template: '<Input />',
  }),
}

export const WithPlaceholder: Story = {
  render: () => ({
    components: { Input },
    template: '<Input placeholder="Enter a value..." />',
  }),
}

export const WithValue: Story = {
  args: { modelValue: 'Prefilled value' },
  render: (args) => ({
    components: { Input },
    setup() {
      return { args }
    },
    template: '<Input v-bind="args" />',
  }),
}

export const Disabled: Story = {
  args: { modelValue: 'Cannot edit' },
  render: (args) => ({
    components: { Input },
    setup() {
      return { args }
    },
    template: '<Input v-bind="args" disabled />',
  }),
}
