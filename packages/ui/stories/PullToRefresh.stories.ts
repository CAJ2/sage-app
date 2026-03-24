import type { Meta, StoryObj } from '@nuxtjs/storybook'

import PullToRefresh from '../app/components/ui/PullToRefresh.vue'

const meta: Meta<typeof PullToRefresh> = {
  title: 'UI/PullToRefresh',
  component: PullToRefresh,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A pull-to-refresh container. On touch/mouse drag downward from the top of a scrollable list, it reveals a loading indicator and emits a `load` event. Requires a touch or scroll gesture to trigger — use a mobile viewport to test.',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    pullDownThreshold: { control: { type: 'range', min: 32, max: 128, step: 8 } },
  },
  args: {
    disabled: false,
    pullDownThreshold: 64,
  },
}
export default meta
type Story = StoryObj<typeof PullToRefresh>

export const Default: Story = {
  render: (args) => ({
    components: { PullToRefresh },
    setup() {
      return {
        args,
        onLoad: ({ done }: { done: () => void }) => {
          setTimeout(done, 1500)
        },
      }
    },
    template: `
      <div class="h-96 w-80 overflow-auto border rounded">
        <PullToRefresh v-bind="args" @load="onLoad">
          <ul class="divide-y">
            <li v-for="i in 20" :key="i" class="px-4 py-3 text-sm">List item {{ i }}</li>
          </ul>
        </PullToRefresh>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { PullToRefresh },
    setup() {
      return { args }
    },
    template: `
      <div class="h-96 w-80 overflow-auto border rounded">
        <PullToRefresh v-bind="args">
          <ul class="divide-y">
            <li v-for="i in 20" :key="i" class="px-4 py-3 text-sm">List item {{ i }}</li>
          </ul>
        </PullToRefresh>
      </div>
    `,
  }),
}
