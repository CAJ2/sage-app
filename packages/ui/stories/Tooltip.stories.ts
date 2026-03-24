import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'
import Tooltip from '../app/components/tooltip/Tooltip.vue'
import TooltipContent from '../app/components/tooltip/TooltipContent.vue'
import TooltipProvider from '../app/components/tooltip/TooltipProvider.vue'
import TooltipTrigger from '../app/components/tooltip/TooltipTrigger.vue'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A tooltip that appears on hover. Must be wrapped in TooltipProvider. Compose with TooltipTrigger and TooltipContent.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: () => ({
    components: { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button },
    template: `
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    `,
  }),
}

export const OnIcon: Story = {
  render: () => ({
    components: { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent },
    template: `
      <TooltipProvider>
        <div class="flex gap-4">
          <Tooltip>
            <TooltipTrigger class="rounded p-2 hover:bg-muted">
              <span class="text-lg">⭐</span>
            </TooltipTrigger>
            <TooltipContent>Add to favourites</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger class="rounded p-2 hover:bg-muted">
              <span class="text-lg">🔗</span>
            </TooltipTrigger>
            <TooltipContent>Copy link</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger class="rounded p-2 hover:bg-muted">
              <span class="text-lg">🗑️</span>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    `,
  }),
}
