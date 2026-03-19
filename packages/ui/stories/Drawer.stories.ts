import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'
import Drawer from '../app/components/drawer/Drawer.vue'
import DrawerClose from '../app/components/drawer/DrawerClose.vue'
import DrawerContent from '../app/components/drawer/DrawerContent.vue'
import DrawerDescription from '../app/components/drawer/DrawerDescription.vue'
import DrawerFooter from '../app/components/drawer/DrawerFooter.vue'
import DrawerHeader from '../app/components/drawer/DrawerHeader.vue'
import DrawerTitle from '../app/components/drawer/DrawerTitle.vue'
import DrawerTrigger from '../app/components/drawer/DrawerTrigger.vue'

const meta: Meta<typeof Drawer> = {
  title: 'UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A bottom sheet / drawer built on vaul-vue. Slides up from the bottom of the screen. Compose with DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, and DrawerClose.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Drawer>

export const Default: Story = {
  render: () => ({
    components: {
      Drawer,
      DrawerTrigger,
      DrawerContent,
      DrawerHeader,
      DrawerFooter,
      DrawerTitle,
      DrawerClose,
      Button,
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div class="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Move Goal</DrawerTitle>
            </DrawerHeader>
            <div class="p-4 pb-0 text-sm">
              Adjust your daily activity goal here.
            </div>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button>Submit</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    `,
  }),
}

export const WithDescription: Story = {
  render: () => ({
    components: {
      Drawer,
      DrawerTrigger,
      DrawerContent,
      DrawerHeader,
      DrawerFooter,
      DrawerTitle,
      DrawerDescription,
      DrawerClose,
      Button,
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Open with Description</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div class="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Delete Item</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone. The item will be permanently deleted.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button variant="destructive">Delete</Button>
              <DrawerClose as-child>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    `,
  }),
}
