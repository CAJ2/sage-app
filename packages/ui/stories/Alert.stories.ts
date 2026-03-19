import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Alert from '../app/components/alert/alert.vue'
import AlertDescription from '../app/components/alert/alert_description.vue'
import AlertTitle from '../app/components/alert/alert_title.vue'

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error'],
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

export const Error: Story = {
  args: { variant: 'error' },
  render: (args) => ({
    components: { Alert, AlertTitle, AlertDescription },
    setup() {
      return { args }
    },
    template: `
      <Alert v-bind="args">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>An error occurred while processing your request. Please try again.</AlertDescription>
      </Alert>
    `,
  }),
}
