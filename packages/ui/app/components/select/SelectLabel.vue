<script setup lang="ts">
import { SelectLabel, type SelectLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '../lib/utils'

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <SelectLabel
    data-slot="select-label"
    :class="
      cn('block px-3 pt-2 pb-1 text-xs font-medium text-base-content/50 uppercase', props.class)
    "
  >
    <slot />
  </SelectLabel>
</template>
