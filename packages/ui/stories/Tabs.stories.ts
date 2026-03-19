import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Tabs from '../app/components/tabs/Tabs.vue'
import TabsContent from '../app/components/tabs/TabsContent.vue'
import TabsList from '../app/components/tabs/TabsList.vue'
import TabsTrigger from '../app/components/tabs/TabsTrigger.vue'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    defaultValue: { control: 'text' },
  },
  args: {
    defaultValue: 'account',
  },
}
export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: (args) => ({
    components: { Tabs, TabsList, TabsTrigger, TabsContent },
    setup() {
      return { args }
    },
    template: `
      <div class="w-96">
        <Tabs v-bind="args">
          <TabsList class="w-full">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" class="p-4">
            <p class="text-sm">Manage your account preferences.</p>
          </TabsContent>
          <TabsContent value="password" class="p-4">
            <p class="text-sm">Change your password here.</p>
          </TabsContent>
          <TabsContent value="settings" class="p-4">
            <p class="text-sm">Adjust your notification settings.</p>
          </TabsContent>
        </Tabs>
      </div>
    `,
  }),
}

export const TwoTabs: Story = {
  args: { defaultValue: 'overview' },
  render: (args) => ({
    components: { Tabs, TabsList, TabsTrigger, TabsContent },
    setup() {
      return { args }
    },
    template: `
      <div class="w-80">
        <Tabs v-bind="args">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" class="p-4">
            <p class="text-sm">Summary of the current item.</p>
          </TabsContent>
          <TabsContent value="details" class="p-4">
            <p class="text-sm">Full details and metadata.</p>
          </TabsContent>
        </Tabs>
      </div>
    `,
  }),
}
