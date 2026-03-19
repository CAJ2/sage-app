import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Skeleton from '../app/components/skeleton/Skeleton.vue'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: () => ({
    components: { Skeleton },
    template: '<Skeleton class="h-4 w-48" />',
  }),
}

export const CardSkeleton: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="w-72 space-y-3 rounded-xl border p-4">
        <Skeleton class="h-32 w-full rounded-lg" />
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
        <div class="flex gap-2 pt-2">
          <Skeleton class="h-8 w-20 rounded-md" />
          <Skeleton class="h-8 w-20 rounded-md" />
        </div>
      </div>
    `,
  }),
}

export const ListSkeleton: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="w-72 space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3">
          <Skeleton class="h-10 w-10 rounded-full" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-3 w-3/4" />
          </div>
        </div>
      </div>
    `,
  }),
}
