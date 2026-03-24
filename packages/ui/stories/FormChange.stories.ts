import type { Meta, StoryObj } from '@nuxtjs/storybook'

import NewForm from '../app/components/form/change/New.vue'
import SaveStatus from '../app/components/form/change/SaveStatus.vue'
import TitleForm from '../app/components/form/change/Title.vue'

// SaveStatus is the primary component for the meta; others are exported separately
const meta: Meta<typeof SaveStatus> = {
  title: 'Forms/Change',
  component: SaveStatus,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof SaveStatus>

export const StatusSaved: Story = {
  args: { status: 'saved' },
  render: (args) => ({
    components: { SaveStatus },
    setup() {
      return { args }
    },
    template: '<SaveStatus v-bind="args" />',
  }),
}

export const StatusSaving: Story = {
  args: { status: 'saving' },
  render: (args) => ({
    components: { SaveStatus },
    setup() {
      return { args }
    },
    template: '<SaveStatus v-bind="args" />',
  }),
}

export const StatusNotSaved: Story = {
  args: { status: 'not_saved' },
  render: (args) => ({
    components: { SaveStatus },
    setup() {
      return { args }
    },
    template: '<SaveStatus v-bind="args" />',
  }),
}

export const StatusError: Story = {
  args: { status: 'error' },
  render: (args) => ({
    components: { SaveStatus },
    setup() {
      return { args }
    },
    template: '<SaveStatus v-bind="args" />',
  }),
}

export const AllStatuses: Story = {
  render: () => ({
    components: { SaveStatus },
    template: `
      <div class="flex flex-col gap-4">
        <SaveStatus status="saved" />
        <SaveStatus status="saving" />
        <SaveStatus status="not_saved" />
        <SaveStatus status="error" />
      </div>
    `,
  }),
}

export const TitleEditor: Story = {
  render: () => ({
    components: { TitleForm },
    setup() {
      return {
        data: { title: 'My Change Title', description: 'A short description of this change.' },
      }
    },
    template: `
      <div class="w-full max-w-lg p-4">
        <TitleForm :data="data" @submit="(v) => console.log('submit', v)" />
      </div>
    `,
  }),
}

export const NewChangeForm: Story = {
  render: () => ({
    components: { NewForm },
    template: `
      <div class="p-4">
        <NewForm @submit="(v) => console.log('new change', v)" />
      </div>
    `,
  }),
}
