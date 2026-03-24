import type { Meta, StoryObj } from '@nuxtjs/storybook'

import JsonSchema from '../app/components/form/JsonSchema.vue'

const simpleSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    age: { type: 'integer', title: 'Age', minimum: 0 },
    bio: { type: 'string', title: 'Biography' },
  },
  required: ['name'],
}

const simpleUiSchema = {
  type: 'VerticalLayout',
  elements: [
    { type: 'Control', scope: '#/properties/name' },
    { type: 'Control', scope: '#/properties/age' },
    { type: 'Control', scope: '#/properties/bio' },
  ],
}

const meta: Meta<typeof JsonSchema> = {
  title: 'Forms/JsonSchema',
  component: JsonSchema,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Renders a dynamic form from a JSON Schema + UI Schema using @jsonforms/vue. Pass `schema`, `uischema`, and `data` to control the form structure and initial values.',
      },
    },
  },
  argTypes: {
    readOnly: { control: 'boolean' },
  },
  args: {
    schema: simpleSchema,
    uischema: simpleUiSchema,
    data: { name: '', age: null, bio: '' },
    readOnly: false,
  },
}
export default meta
type Story = StoryObj<typeof JsonSchema>

export const SimpleForm: Story = {
  render: (args) => ({
    components: { JsonSchema },
    setup() {
      return { args }
    },
    template: '<div class="w-96 p-4"><JsonSchema v-bind="args" /></div>',
  }),
}

export const ReadOnly: Story = {
  args: {
    data: { name: 'Alice', age: 30, bio: 'A software engineer.' },
    readOnly: true,
  },
  render: (args) => ({
    components: { JsonSchema },
    setup() {
      return { args }
    },
    template: '<div class="w-96 p-4"><JsonSchema v-bind="args" /></div>',
  }),
}
