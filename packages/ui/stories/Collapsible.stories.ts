import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Collapsible from '../app/components/collapsible/Collapsible.vue'
import CollapsibleContent from '../app/components/collapsible/CollapsibleContent.vue'
import CollapsibleTrigger from '../app/components/collapsible/CollapsibleTrigger.vue'

const meta: Meta<typeof Collapsible> = {
  title: 'UI/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    defaultOpen: false,
    disabled: false,
  },
}
export default meta
type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  render: (args) => ({
    components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
    setup() {
      return { args }
    },
    template: `
      <div class="w-80">
        <Collapsible v-bind="args">
          <CollapsibleTrigger class="btn btn-outline btn-sm w-full">
            Toggle section
          </CollapsibleTrigger>
          <CollapsibleContent class="mt-2 rounded border p-3 text-sm">
            Hidden content revealed when the section is open.
          </CollapsibleContent>
        </Collapsible>
      </div>
    `,
  }),
}

export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => ({
    components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
    setup() {
      return { args }
    },
    template: `
      <div class="w-80">
        <Collapsible v-bind="args">
          <CollapsibleTrigger class="btn btn-outline btn-sm w-full">
            Toggle section
          </CollapsibleTrigger>
          <CollapsibleContent class="mt-2 rounded border p-3 text-sm">
            This content is open by default.
          </CollapsibleContent>
        </Collapsible>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
    setup() {
      return { args }
    },
    template: `
      <div class="w-80">
        <Collapsible v-bind="args">
          <CollapsibleTrigger class="btn btn-outline btn-sm w-full" disabled>
            Toggle (disabled)
          </CollapsibleTrigger>
          <CollapsibleContent class="mt-2 rounded border p-3 text-sm">
            This content cannot be toggled.
          </CollapsibleContent>
        </Collapsible>
      </div>
    `,
  }),
}
