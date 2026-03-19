import type { Meta, StoryObj } from '@nuxtjs/storybook'

import ActionButtons from '../app/components/model/list/ActionButtons.vue'

/**
 * Stories for model/list display components.
 *
 * NOTE: The entity list-row components (Category, Change, Component, Item,
 * Material, Org, Place, Process, Region, Variant) import from `~/gql` which is
 * generated at the consuming-app level and is not available in this package's
 * Storybook. They are shown here as static HTML mockups for visual reference.
 * Use ActionButtons directly — it has no GraphQL dependency.
 */
const meta: Meta<typeof ActionButtons> = {
  title: 'Model/List',
  component: ActionButtons,
  tags: ['autodocs'],
  argTypes: {
    buttons: {
      control: 'check',
      options: ['select', 'edit', 'delete'],
    },
  },
  args: {
    buttons: ['edit', 'delete'],
  },
}
export default meta
type Story = StoryObj<typeof ActionButtons>

export const ActionButtonsDefault: Story = {
  name: 'ActionButtons',
  render: (args) => ({
    components: { ActionButtons },
    setup() {
      return { args }
    },
    template: '<ActionButtons v-bind="args" @button="(btn) => console.log(btn)" />',
  }),
}

export const ActionButtonsAll: Story = {
  name: 'ActionButtons — all',
  args: { buttons: ['select', 'edit', 'delete'] },
  render: (args) => ({
    components: { ActionButtons },
    setup() {
      return { args }
    },
    template: '<ActionButtons v-bind="args" @button="(btn) => console.log(btn)" />',
  }),
}

/** Static mockup of the list-row shapes. Not interactive — just a visual reference. */
export const ListRowShowcase: Story = {
  name: 'List Rows (static mockup)',
  render: () => ({
    template: `
      <ul class="w-full max-w-lg divide-y border rounded">
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <div class="size-10 rounded bg-primary/20 shrink-0"></div>
          <div class="flex-1">
            <div class="font-medium text-sm">Category Name</div>
            <div class="text-xs opacity-70">Short description of category</div>
          </div>
        </li>
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <span class="badge badge-sm badge-primary">MERGED</span>
          <div class="flex-1">
            <div class="font-medium text-sm">Change: Improve recycled content</div>
            <div class="text-xs opacity-70">Updated recycled material percentages</div>
          </div>
        </li>
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <div class="size-10 rounded bg-secondary/30 shrink-0"></div>
          <div class="flex-1">
            <div class="font-medium text-sm">Component: Steel Frame</div>
            <div class="text-xs opacity-70">Structural steel component</div>
          </div>
        </li>
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <div class="size-10 rounded bg-accent/30 shrink-0"></div>
          <div class="flex-1">
            <div class="font-medium text-sm">Item: Widget Pro</div>
            <div class="text-xs opacity-70">Premium widget for industrial use</div>
          </div>
        </li>
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <div class="size-10 rounded bg-success/20 shrink-0"></div>
          <div class="flex-1">
            <div class="font-medium text-sm">Org: Acme Corp</div>
            <div class="text-xs opacity-70">Manufacturing organisation</div>
          </div>
        </li>
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <div class="flex-1">
            <div class="font-medium text-sm">Place: Berlin Factory</div>
            <div class="text-xs opacity-70">Production facility in Germany</div>
          </div>
        </li>
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <div class="flex-1">
            <div class="font-medium text-sm">Process: Assembly</div>
            <div class="text-xs opacity-70">Final assembly stage</div>
          </div>
        </li>
        <li class="list-row flex items-center gap-3 px-4 py-3">
          <div class="flex-1">
            <div class="font-medium text-sm">Region: Europe</div>
          </div>
        </li>
      </ul>
    `,
  }),
}
