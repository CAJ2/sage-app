<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :is-focused="isFocused"
    :applied-options="appliedOptions"
  >
    <Select
      :id="control.id + '-input'"
      :class="styles.control.select"
      :model-value="control.data"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      @update:model-value="
        (value: any) => onChange({ target: { value } } as unknown as Event)
      "
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="optionElement in control.options"
            :key="optionElement.value"
            :value="optionElement.value"
            :label="
              optionElement.label ||
              control.schema.oneOf?.find((o) => o.const === optionElement.value)
                ?.title
            "
            :class="styles.control.option"
            >{{ optionElement.label }}</SelectItem
          >
        </SelectGroup>
      </SelectContent>
    </Select>
  </control-wrapper>
</template>

<script lang="ts">
import type {
  ControlElement,
  JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'
import { rankWith, isEnumControl } from '@jsonforms/core'
import { defineComponent } from 'vue'
import type { RendererProps } from '@jsonforms/vue'
import { rendererProps, useJsonFormsEnumControl } from '@jsonforms/vue'
// eslint-disable-next-line import/no-named-default
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useVanillaControl } from '../util'

const controlRenderer = defineComponent({
  name: 'EnumControlRenderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVanillaControl(useJsonFormsEnumControl(props), (target) =>
      target.selectedIndex === 0 ? undefined : target.value,
    )
  },
})

export default controlRenderer

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isEnumControl),
}
</script>
