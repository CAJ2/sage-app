import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Checkbox from '../app/components/form/Checkbox.vue'
import Label from '../app/components/form/Label.vue'

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: () => ({
    components: { Checkbox },
    template: '<Checkbox />',
  }),
}

export const Checked: Story = {
  render: () => ({
    components: { Checkbox },
    template: '<Checkbox :default-checked="true" />',
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Checkbox },
    template: '<Checkbox :disabled="true" />',
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { Checkbox, Label },
    template: `
      <div class="flex items-center gap-2">
        <Checkbox id="terms" />
        <Label for="terms">Accept terms and conditions</Label>
      </div>
    `,
  }),
}
