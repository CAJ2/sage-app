import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Card from '../app/components/card/Card.vue'
import CardContent from '../app/components/card/CardContent.vue'
import Carousel from '../app/components/carousel/Carousel.vue'
import CarouselContent from '../app/components/carousel/CarouselContent.vue'
import CarouselItem from '../app/components/carousel/CarouselItem.vue'
import CarouselNext from '../app/components/carousel/CarouselNext.vue'
import CarouselPrevious from '../app/components/carousel/CarouselPrevious.vue'

const meta: Meta<typeof Carousel> = {
  title: 'UI/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A carousel/slider built on Embla Carousel. Compose with CarouselContent, CarouselItem, CarouselPrevious, and CarouselNext. Supports horizontal (default) and vertical orientations.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    orientation: 'horizontal',
  },
}
export default meta
type Story = StoryObj<typeof Carousel>

export const Default: Story = {
  render: (args) => ({
    components: {
      Carousel,
      CarouselContent,
      CarouselItem,
      CarouselNext,
      CarouselPrevious,
      Card,
      CardContent,
    },
    setup() {
      return { args }
    },
    template: `
      <div class="w-80 px-8">
        <Carousel v-bind="args">
          <CarouselContent>
            <CarouselItem v-for="n in 5" :key="n">
              <Card>
                <CardContent class="flex aspect-square items-center justify-center p-6">
                  <span class="text-4xl font-semibold">{{ n }}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: {
      Carousel,
      CarouselContent,
      CarouselItem,
      CarouselNext,
      CarouselPrevious,
      Card,
      CardContent,
    },
    setup() {
      return { args }
    },
    template: `
      <div class="w-64 py-8">
        <Carousel v-bind="args" class="w-full">
          <CarouselContent class="-mt-1 h-64">
            <CarouselItem v-for="n in 5" :key="n" class="pt-1">
              <Card>
                <CardContent class="flex items-center justify-center p-4">
                  <span class="text-2xl font-semibold">Slide {{ n }}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    `,
  }),
}
