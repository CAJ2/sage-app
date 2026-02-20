<template>
  <label v-if="label.visible" :class="styles.label.root">
    {{ label.text }}
  </label>
</template>

<script lang="ts">
import type { JsonFormsRendererRegistryEntry, LabelElement } from '@jsonforms/core'
import { rankWith, uiTypeIs } from '@jsonforms/core'
import { defineComponent } from 'vue'
import type { RendererProps } from '@jsonforms/vue'
import { rendererProps, useJsonFormsLabel } from '@jsonforms/vue'
import { useVanillaLabel } from '../util'

const labelRenderer = defineComponent({
  name: 'LabelRenderer',
  props: {
    ...rendererProps<LabelElement>(),
  },
  setup(props: RendererProps<LabelElement>) {
    return useVanillaLabel(useJsonFormsLabel(props))
  },
})

export default labelRenderer

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: labelRenderer,
  tester: rankWith(1, uiTypeIs('Label')),
}
</script>
