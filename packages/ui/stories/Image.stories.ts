import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Image from '../app/components/ui/Image.vue'

const meta: Meta<typeof Image> = {
  title: 'UI/Image',
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    fit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'inside', 'outside'],
    },
    width: { control: { type: 'number' } },
    height: { control: { type: 'number' } },
  },
  args: {
    alt: 'Image',
    fit: 'contain',
    width: 40,
    height: 40,
  },
}
export default meta
type Story = StoryObj<typeof Image>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/seed/sage/160/160',
    alt: 'A placeholder image',
    width: 40,
    height: 40,
  },
  render: (args) => ({
    components: { Image },
    setup() {
      return { args }
    },
    template:
      '<div class="w-48 h-48 border rounded"><Image v-bind="args" class="w-full h-full" /></div>',
  }),
}

export const Icon: Story = {
  args: {
    src: 'icon://lucide:star',
    alt: 'Star icon',
    width: 16,
    height: 16,
  },
  render: (args) => ({
    components: { Image },
    setup() {
      return { args }
    },
    template: '<Image v-bind="args" />',
  }),
}

export const NullSrc: Story = {
  args: {
    src: null,
    alt: 'Missing image',
    width: 40,
    height: 40,
  },
  render: (args) => ({
    components: { Image },
    setup() {
      return { args }
    },
    template:
      '<div class="w-40 h-40 border rounded"><Image v-bind="args" class="w-full h-full" /></div>',
  }),
}
