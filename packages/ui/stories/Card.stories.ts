import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Button from '../app/components/button/Button.vue'
import Card from '../app/components/card/Card.vue'
import CardContent from '../app/components/card/CardContent.vue'
import CardDescription from '../app/components/card/CardDescription.vue'
import CardFooter from '../app/components/card/CardFooter.vue'
import CardHeader from '../app/components/card/CardHeader.vue'
import CardImage from '../app/components/card/CardImage.vue'
import CardTitle from '../app/components/card/CardTitle.vue'

const SAMPLE_IMAGE =
  'https://images.unsplash.com/photo-1680868543815-b8666dba60f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=80'

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
      <div class="w-80">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>A brief description of the card content goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-base-content/70">This is the main content area of the card. You can put any content here.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </div>
    `,
  }),
}

export const WithImage: Story = {
  render: () => ({
    components: {
      Card,
      CardImage,
      CardContent,
      CardTitle,
      CardDescription,
      CardFooter,
      Button,
    },
    setup: () => ({ SAMPLE_IMAGE }),
    template: `
      <div class="w-80">
        <Card>
          <CardImage :src="SAMPLE_IMAGE" alt="Mountain landscape" />
          <CardContent class="pt-4">
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Some quick example text to build on the card title and make up the bulk of the card's content.</CardDescription>
          </CardContent>
          <CardFooter>
            <Button size="sm">Go somewhere</Button>
          </CardFooter>
        </Card>
      </div>
    `,
  }),
}

export const WithFeaturedHeader: Story = {
  render: () => ({
    components: { Card, CardHeader, CardContent, CardTitle, CardDescription },
    template: `
      <div class="w-80">
        <Card>
          <CardHeader variant="featured">Featured</CardHeader>
          <CardContent class="pt-4">
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Some quick example text to build on the card title and make up the bulk of the card's content.</CardDescription>
          </CardContent>
        </Card>
      </div>
    `,
  }),
}

export const AccentBorder: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent },
    template: `
      <div class="w-80">
        <Card variant="accent">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>With supporting text below as a natural lead-in to additional content.</CardDescription>
          </CardHeader>
          <CardContent>
            <a class="inline-flex items-center gap-x-1 text-sm font-semibold text-primary hover:underline" href="#">
              Card link
            </a>
          </CardContent>
        </Card>
      </div>
    `,
  }),
}

export const Simple: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardContent },
    template: `
      <div class="w-80">
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-base-content/70">A minimal card with just a title and content.</p>
          </CardContent>
        </Card>
      </div>
    `,
  }),
}
