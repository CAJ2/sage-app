import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Label from '../app/components/form/Label.vue'
import Switch from '../app/components/form/Switch.vue'

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  render: () => ({
    components: { Switch },
    template: '<Switch />',
  }),
}

export const Checked: Story = {
  render: () => ({
    components: { Switch },
    template: '<Switch :default-checked="true" />',
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Switch },
    template: '<Switch :disabled="true" />',
  }),
}

export const DisabledChecked: Story = {
  render: () => ({
    components: { Switch },
    template: '<Switch :disabled="true" :default-checked="true" />',
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { Switch, Label },
    template: `
      <div class="flex items-center gap-3">
        <Switch id="notifications" />
        <Label for="notifications">Enable notifications</Label>
      </div>
    `,
  }),
}
