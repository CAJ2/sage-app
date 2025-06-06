<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :is-focused="isFocused"
    :applied-options="appliedOptions"
  >
    <select
      :id="control.id + '-input'"
      :class="styles.control.select"
      :value="control.data"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      @change="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <option key="empty" value="" :class="styles.control.option" />
      <option
        v-for="optionElement in control.options"
        :key="optionElement.value"
        :value="optionElement.value"
        :label="optionElement.label"
        :class="styles.control.option"
      ></option>
    </select>
  </control-wrapper>
</template>

<script lang="ts">
import type {
  ControlElement,
  JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'
import { rankWith, isOneOfEnumControl } from '@jsonforms/core'
import { defineComponent } from 'vue'
import type { RendererProps } from '@jsonforms/vue'
import { rendererProps, useJsonFormsOneOfEnumControl } from '@jsonforms/vue'
// eslint-disable-next-line import/no-named-default
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useVanillaControl } from '../util'

const controlRenderer = defineComponent({
  name: 'EnumOneofControlRenderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVanillaControl(useJsonFormsOneOfEnumControl(props), (target) =>
      target.selectedIndex === 0 ? undefined : target.value,
    )
  },
})

export default controlRenderer

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(5, isOneOfEnumControl),
}
</script>
