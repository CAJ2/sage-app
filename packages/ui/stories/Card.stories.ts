import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'
import Card from '../app/components/card/Card.vue'
import CardContent from '../app/components/card/CardContent.vue'
import CardDescription from '../app/components/card/CardDescription.vue'
import CardFooter from '../app/components/card/CardFooter.vue'
import CardHeader from '../app/components/card/CardHeader.vue'
import CardTitle from '../app/components/card/CardTitle.vue'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button },
    template: `
      <div class="w-96">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>A brief description of the card content goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm">This is the main content area of the card. You can put any content here.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </div>
    `,
  }),
}

export const Simple: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardContent },
    template: `
      <div class="w-96">
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm">A minimal card with just a title and content.</p>
          </CardContent>
        </Card>
      </div>
    `,
  }),
}
