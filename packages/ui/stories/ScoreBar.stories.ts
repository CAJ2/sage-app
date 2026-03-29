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
      options: ['A_PLUS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'UNKNOWN'],
    },
    ratingFmt: { control: 'text' },
    scoreSlide: { control: 'boolean' },
  },
  args: {
    size: 'medium',
    score: 72,
    rating: 'B',
    ratingFmt: 'B',
    scoreSlide: false,
  },
}

export default meta
type Story = StoryObj<typeof Bar>

export const SmallGood: Story = {
  args: { size: 'small', score: 72, rating: 'B', ratingFmt: 'B' },
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args }
    },
    template: '<div class="w-64"><Bar v-bind="args" /></div>',
  }),
}

export const MediumExcellent: Story = {
  args: { size: 'medium', score: 95, rating: 'A_PLUS', ratingFmt: 'A+' },
  render: (args) => ({
    components: { Bar },
    setup() {
      return { args }
    },
    template: '<div class="w-64"><Bar v-bind="args" /></div>',
  }),
}

export const LargePoor: Story = {
  args: { size: 'large', score: 20, rating: 'G', ratingFmt: 'G' },
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
          <p class="text-xs text-gray-500 mb-1">A+</p>
          <Bar size="medium" :score="100" rating="A_PLUS" rating-fmt="A+" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">A</p>
          <Bar size="medium" :score="88" rating="A" rating-fmt="A" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">B</p>
          <Bar size="medium" :score="75" rating="B" rating-fmt="B" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">C</p>
          <Bar size="medium" :score="60" rating="C" rating-fmt="C" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">D</p>
          <Bar size="medium" :score="45" rating="D" rating-fmt="D" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">E</p>
          <Bar size="medium" :score="30" rating="E" rating-fmt="E" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">F</p>
          <Bar size="medium" :score="20" rating="F" rating-fmt="F" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">G</p>
          <Bar size="medium" :score="10" rating="G" rating-fmt="G" />
        </div>
      </div>
    `,
  }),
}
