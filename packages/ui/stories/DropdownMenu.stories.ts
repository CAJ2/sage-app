import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'

import Button from '../app/components/button/Button.vue'
import DropdownMenu from '../app/components/dropdown-menu/DropdownMenu.vue'
import DropdownMenuCheckboxItem from '../app/components/dropdown-menu/DropdownMenuCheckboxItem.vue'
import DropdownMenuContent from '../app/components/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '../app/components/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuLabel from '../app/components/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '../app/components/dropdown-menu/DropdownMenuSeparator.vue'
import DropdownMenuShortcut from '../app/components/dropdown-menu/DropdownMenuShortcut.vue'
import DropdownMenuSub from '../app/components/dropdown-menu/DropdownMenuSub.vue'
import DropdownMenuSubContent from '../app/components/dropdown-menu/DropdownMenuSubContent.vue'
import DropdownMenuSubTrigger from '../app/components/dropdown-menu/DropdownMenuSubTrigger.vue'
import DropdownMenuTrigger from '../app/components/dropdown-menu/DropdownMenuTrigger.vue'

const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DropdownMenu>

export const Default: Story = {
  render: () => ({
    components: {
      DropdownMenu,
      DropdownMenuTrigger,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuShortcut,
      Button,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Log out <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
}

export const WithSubMenu: Story = {
  render: () => ({
    components: {
      DropdownMenu,
      DropdownMenuTrigger,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuSub,
      DropdownMenuSubTrigger,
      DropdownMenuSubContent,
      Button,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">With Sub Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-48">
          <DropdownMenuItem>New Tab</DropdownMenuItem>
          <DropdownMenuItem>New Window</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Save Page</DropdownMenuItem>
              <DropdownMenuItem>Create Shortcut</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
}

export const WithCheckboxItems: Story = {
  render: () => ({
    components: {
      DropdownMenu,
      DropdownMenuTrigger,
      DropdownMenuContent,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuCheckboxItem,
      Button,
    },
    setup() {
      const showStatusBar = ref(true)
      const showToolbar = ref(false)
      return { showStatusBar, showToolbar }
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">View Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-48">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem v-model:checked="showStatusBar">
            Status Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model:checked="showToolbar">
            Toolbar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
}
