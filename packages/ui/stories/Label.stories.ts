import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Input from '../app/components/form/Input.vue'
import Label from '../app/components/form/Label.vue'

const meta: Meta<typeof Label> = {
  title: 'Forms/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    for: { control: 'text' },
  },
  args: {
    for: 'input-id',
  },
}
export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  render: (args) => ({
    components: { Label },
    setup() {
      return { args }
    },
    template: '<Label v-bind="args">Full Name</Label>',
  }),
}

export const WithInput: Story = {
  render: () => ({
    components: { Label, Input },
    template: `
      <div class="grid w-full max-w-sm gap-1.5">
        <Label for="email">Email address</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
    `,
  }),
}
