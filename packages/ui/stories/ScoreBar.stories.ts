import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Bar from '../app/components/score/Bar.vue'

const meta: Meta<typeof Bar> = {
  title: 'UI/ScoreBar',
  component: Bar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    score: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    rating: {
      control: 'select',
      options: ['POOR', 'FAIR', 'GOOD', 'VERY_GOOD', 'EXCELLENT', 'UNKNOWN'],
    },
    ratingFmt: { control: 'text' },
    scoreSlide: { control: 'boolean' },
  },
  args: {
    size: 'medium',
    score: 72,
    rating: 'GOOD',
    ratingFmt: 'Good',
    scoreSlide: false,
  },
}

export default meta
type Story = StoryObj<typeof Bar>

export const SmallGood: Story = {
  args: { size: 'small', score: 72, rating: 'GOOD', ratingFmt: 'Good' },
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args }
    },
    template: '<div class="w-64"><Bar v-bind="args" /></div>',
  }),
}

export const MediumExcellent: Story = {
  args: { size: 'medium', score: 95, rating: 'EXCELLENT', ratingFmt: 'Excellent' },
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args }
    },
    template: '<div class="w-64"><Bar v-bind="args" /></div>',
  }),
}

export const LargePoor: Story = {
  args: { size: 'large', score: 20, rating: 'POOR', ratingFmt: 'Poor' },
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args }
    },
    template: '<div class="w-64"><Bar v-bind="args" /></div>',
  }),
}

export const Playground: Story = {
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args }
    },
    template: '<div class="w-64"><Bar v-bind="args" /></div>',
  }),
}

export const AllRatings: Story = {
  render: () => ({
    components: { Bar },
    template: `
      <div class="flex flex-col gap-6 w-72">
        <div>
          <p class="text-xs text-gray-500 mb-1">POOR (20)</p>
          <Bar size="medium" :score="20" rating="POOR" rating-fmt="Poor" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">FAIR (40)</p>
          <Bar size="medium" :score="40" rating="FAIR" rating-fmt="Fair" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">GOOD (65)</p>
          <Bar size="medium" :score="65" rating="GOOD" rating-fmt="Good" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">VERY GOOD (80)</p>
          <Bar size="medium" :score="80" rating="VERY_GOOD" rating-fmt="Very Good" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">EXCELLENT (95)</p>
          <Bar size="medium" :score="95" rating="EXCELLENT" rating-fmt="Excellent" />
        </div>
      </div>
    `,
  }),
}
