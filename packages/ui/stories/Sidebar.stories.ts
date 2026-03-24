import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Sidebar from '../app/components/sidebar/Sidebar.vue'
import SidebarContent from '../app/components/sidebar/SidebarContent.vue'
import SidebarFooter from '../app/components/sidebar/SidebarFooter.vue'
import SidebarGroup from '../app/components/sidebar/SidebarGroup.vue'
import SidebarGroupContent from '../app/components/sidebar/SidebarGroupContent.vue'
import SidebarGroupLabel from '../app/components/sidebar/SidebarGroupLabel.vue'
import SidebarHeader from '../app/components/sidebar/SidebarHeader.vue'
import SidebarInset from '../app/components/sidebar/SidebarInset.vue'
import SidebarMenu from '../app/components/sidebar/SidebarMenu.vue'
import SidebarMenuButton from '../app/components/sidebar/SidebarMenuButton.vue'
import SidebarMenuItem from '../app/components/sidebar/SidebarMenuItem.vue'
import SidebarProvider from '../app/components/sidebar/SidebarProvider.vue'
import SidebarSeparator from '../app/components/sidebar/SidebarSeparator.vue'
import SidebarTrigger from '../app/components/sidebar/SidebarTrigger.vue'

const meta: Meta<typeof Sidebar> = {
  title: 'UI/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A composable sidebar layout. Must be wrapped in SidebarProvider. Supports left/right sides and icon-collapsible mode. Use SidebarInset for the main content area.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Sidebar>

const menuItems = [
  { title: 'Dashboard', icon: '🏠' },
  { title: 'Products', icon: '📦' },
  { title: 'Analytics', icon: '📊' },
  { title: 'Settings', icon: '⚙️' },
]

export const Default: Story = {
  render: () => ({
    components: {
      SidebarProvider,
      Sidebar,
      SidebarContent,
      SidebarHeader,
      SidebarFooter,
      SidebarGroup,
      SidebarGroupLabel,
      SidebarGroupContent,
      SidebarMenu,
      SidebarMenuItem,
      SidebarMenuButton,
      SidebarTrigger,
      SidebarInset,
    },
    setup() {
      return { menuItems }
    },
    template: `
      <div class="flex h-screen">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader class="p-4 font-bold text-lg">My App</SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem v-for="item in menuItems" :key="item.title">
                      <SidebarMenuButton>
                        <span>{{ item.icon }}</span>
                        <span>{{ item.title }}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter class="p-4 text-xs text-muted-foreground">v1.0.0</SidebarFooter>
          </Sidebar>
          <SidebarInset class="flex flex-col">
            <header class="flex h-12 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <span class="text-sm font-medium">Page Title</span>
            </header>
            <main class="flex-1 p-4 text-sm text-muted-foreground">Main content area</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    `,
  }),
}

export const Collapsible: Story = {
  render: () => ({
    components: {
      SidebarProvider,
      Sidebar,
      SidebarContent,
      SidebarHeader,
      SidebarGroup,
      SidebarGroupContent,
      SidebarMenu,
      SidebarMenuItem,
      SidebarMenuButton,
      SidebarTrigger,
      SidebarInset,
    },
    setup() {
      return { menuItems }
    },
    template: `
      <div class="flex h-screen">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader class="p-4 font-bold">App</SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem v-for="item in menuItems" :key="item.title">
                      <SidebarMenuButton :tooltip="item.title">
                        <span>{{ item.icon }}</span>
                        <span>{{ item.title }}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset class="flex flex-col">
            <header class="flex h-12 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <span class="text-sm font-medium">Collapsible Sidebar</span>
            </header>
            <main class="flex-1 p-4 text-sm text-muted-foreground">Toggle sidebar with the trigger button</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    `,
  }),
}

export const Right: Story = {
  render: () => ({
    components: {
      SidebarProvider,
      Sidebar,
      SidebarContent,
      SidebarGroup,
      SidebarGroupLabel,
      SidebarGroupContent,
      SidebarMenu,
      SidebarMenuItem,
      SidebarMenuButton,
      SidebarTrigger,
      SidebarInset,
      SidebarSeparator,
    },
    setup() {
      return { menuItems }
    },
    template: `
      <div class="flex h-screen">
        <SidebarProvider>
          <SidebarInset class="flex flex-col">
            <header class="flex h-12 items-center justify-between border-b px-4">
              <span class="text-sm font-medium">Content</span>
              <SidebarTrigger />
            </header>
            <main class="flex-1 p-4 text-sm text-muted-foreground">Main content with right sidebar</main>
          </SidebarInset>
          <Sidebar side="right">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Properties</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem v-for="item in menuItems" :key="item.title">
                      <SidebarMenuButton>
                        <span>{{ item.icon }}</span>
                        <span>{{ item.title }}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
    `,
  }),
}
