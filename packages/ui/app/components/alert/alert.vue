<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '../lib/utils'
import { type AlertVariants, alertVariants } from './variants'

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: AlertVariants['variant']
}>()
</script>

<template>
  <div :class="cn(alertVariants({ variant }), props.class)" role="alert" tabindex="-1">
    <div class="flex">
      <div v-if="$slots.icon" class="shrink-0">
        <slot name="icon" />
      </div>
      <div :class="$slots.icon ? 'ms-3' : undefined">
        <slot />
      </div>
    </div>
  </div>
</template>
