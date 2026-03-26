import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Alert from '../app/components/alert/Alert.vue'
import AlertDescription from '../app/components/alert/AlertDescription.vue'
import AlertTitle from '../app/components/alert/AlertTitle.vue'

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning'],
    },
  },
  args: {
    variant: 'default',
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => ({
    components: { Alert, AlertTitle, AlertDescription },
    setup() {
      return { args }
    },
    template: `
      <Alert v-bind="args">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>This is an informational alert message.</AlertDescription>
      </Alert>
    `,
  }),
}

export const Success: Story = {
  args: { variant: 'success' },
  render: (args) => ({
    components: { Alert, AlertTitle, AlertDescription },
    setup() {
      return { args }
    },
    template: `
      <Alert v-bind="args">
        <template #icon>
          <span class="inline-flex items-center justify-center size-8 rounded-full border-4 border-success/20 bg-success/30 text-success">
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
        </template>
        <AlertTitle>Successfully updated.</AlertTitle>
        <AlertDescription>You have successfully updated your email preferences.</AlertDescription>
      </Alert>
    `,
  }),
}

export const Error: Story = {
  args: { variant: 'error' },
  render: (args) => ({
    components: { Alert, AlertTitle, AlertDescription },
    setup() {
      return { args }
    },
    template: `
      <Alert v-bind="args">
        <template #icon>
          <span class="inline-flex items-center justify-center size-8 rounded-full border-4 border-error/20 bg-error/30 text-error">
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </span>
        </template>
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Your purchase has been declined.</AlertDescription>
      </Alert>
    `,
  }),
}

export const Warning: Story = {
  args: { variant: 'warning' },
  render: (args) => ({
    components: { Alert, AlertTitle, AlertDescription },
    setup() {
      return { args }
    },
    template: `
      <Alert v-bind="args">
        <template #icon>
          <svg class="shrink-0 size-4 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </template>
        <AlertTitle>Cannot connect to the database</AlertTitle>
        <AlertDescription>We are unable to save any progress at this time.</AlertDescription>
      </Alert>
    `,
  }),
}
