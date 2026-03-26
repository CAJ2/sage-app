<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '../lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex items-center border-t border-base-300 p-4 pt-4 sm:px-6', props.class)">
    <slot />
  </div>
</template>
