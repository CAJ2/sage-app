import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'
import Dialog from '../app/components/dialog/Dialog.vue'
import DialogClose from '../app/components/dialog/DialogClose.vue'
import DialogContent from '../app/components/dialog/DialogContent.vue'
import DialogDescription from '../app/components/dialog/DialogDescription.vue'
import DialogFooter from '../app/components/dialog/DialogFooter.vue'
import DialogHeader from '../app/components/dialog/DialogHeader.vue'
import DialogScrollContent from '../app/components/dialog/DialogScrollContent.vue'
import DialogTitle from '../app/components/dialog/DialogTitle.vue'
import DialogTrigger from '../app/components/dialog/DialogTrigger.vue'

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A modal dialog built on Reka UI. Compose Dialog with DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, and DialogFooter to build full dialogs.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => ({
    components: {
      Dialog,
      DialogTrigger,
      DialogContent,
      DialogHeader,
      DialogFooter,
      DialogTitle,
      DialogDescription,
      DialogClose,
      Button,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div class="py-4 text-sm">
            Profile editing form would go here.
          </div>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
}

export const ScrollContent: Story = {
  render: () => ({
    components: {
      Dialog,
      DialogTrigger,
      DialogScrollContent,
      DialogHeader,
      DialogFooter,
      DialogTitle,
      DialogDescription,
      DialogClose,
      Button,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button>Open Scrollable Dialog</Button>
        </DialogTrigger>
        <DialogScrollContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Please read before continuing.</DialogDescription>
          </DialogHeader>
          <div class="py-4 text-sm space-y-4">
            <p v-for="i in 10" :key="i">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <DialogFooter>
            <DialogClose as-child>
              <Button>Accept</Button>
            </DialogClose>
          </DialogFooter>
        </DialogScrollContent>
      </Dialog>
    `,
  }),
}
