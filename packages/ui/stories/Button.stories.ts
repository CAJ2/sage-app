import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon'],
    },
  },
  args: {
    variant: 'default',
    size: 'default',
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Click me</Button>',
  }),
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Delete</Button>',
  }),
}

export const Outline: Story = {
  args: { variant: 'outline' },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Outline</Button>',
  }),
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Secondary</Button>',
  }),
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Ghost</Button>',
  }),
}

export const Link: Story = {
  args: { variant: 'link' },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Link</Button>',
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4 flex-wrap">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4 flex-wrap">
        <Button disabled>Disabled Default</Button>
        <Button variant="destructive" disabled>Disabled Destructive</Button>
        <Button variant="outline" disabled>Disabled Outline</Button>
      </div>
    `,
  }),
}
