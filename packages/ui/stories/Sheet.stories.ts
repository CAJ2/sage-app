import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'
import Sheet from '../app/components/sheet/Sheet.vue'
import SheetClose from '../app/components/sheet/SheetClose.vue'
import SheetContent from '../app/components/sheet/SheetContent.vue'
import SheetDescription from '../app/components/sheet/SheetDescription.vue'
import SheetFooter from '../app/components/sheet/SheetFooter.vue'
import SheetHeader from '../app/components/sheet/SheetHeader.vue'
import SheetTitle from '../app/components/sheet/SheetTitle.vue'
import SheetTrigger from '../app/components/sheet/SheetTrigger.vue'

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A slide-in panel (sheet) that can appear from any side of the screen. Compose with SheetTrigger, SheetContent (accepts `side` prop), SheetHeader, SheetTitle, SheetDescription, SheetFooter, and SheetClose.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Sheet>

function makeSheetStory(side: 'left' | 'right' | 'top' | 'bottom') {
  return {
    render: () => ({
      components: {
        Sheet,
        SheetTrigger,
        SheetContent,
        SheetHeader,
        SheetTitle,
        SheetDescription,
        SheetFooter,
        SheetClose,
        Button,
      },
      setup() {
        return { side }
      },
      template: `
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline">Open ({{ side }})</Button>
          </SheetTrigger>
          <SheetContent :side="side">
            <SheetHeader>
              <SheetTitle>Panel Title</SheetTitle>
              <SheetDescription>
                This panel slides in from the {{ side }} side.
              </SheetDescription>
            </SheetHeader>
            <div class="py-4 text-sm">Sheet content goes here.</div>
            <SheetFooter>
              <SheetClose as-child>
                <Button>Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      `,
    }),
  }
}

export const Right: Story = makeSheetStory('right')
export const Left: Story = makeSheetStory('left')
export const Top: Story = makeSheetStory('top')
export const Bottom: Story = makeSheetStory('bottom')
