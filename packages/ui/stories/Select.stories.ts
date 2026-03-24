import type { Meta, StoryObj } from '@nuxtjs/storybook'

import Select from '../app/components/select/Select.vue'
import SelectContent from '../app/components/select/SelectContent.vue'
import SelectGroup from '../app/components/select/SelectGroup.vue'
import SelectItem from '../app/components/select/SelectItem.vue'
import SelectLabel from '../app/components/select/SelectLabel.vue'
import SelectSeparator from '../app/components/select/SelectSeparator.vue'
import SelectTrigger from '../app/components/select/SelectTrigger.vue'
import SelectValue from '../app/components/select/SelectValue.vue'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: () => ({
    components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem },
    template: `
      <div class="w-56">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
  }),
}

export const WithGroups: Story = {
  render: () => ({
    components: {
      Select,
      SelectTrigger,
      SelectValue,
      SelectContent,
      SelectItem,
      SelectGroup,
      SelectLabel,
      SelectSeparator,
    },
    template: `
      <div class="w-64">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>North America</SelectLabel>
              <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
              <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
              <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Europe</SelectLabel>
              <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
              <SelectItem value="cet">Central European Time (CET)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Select, SelectTrigger, SelectValue, SelectContent, SelectItem },
    template: `
      <div class="w-56">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Disabled select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
  }),
}
