<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const cardHeaderVariants = cva('', {
  variants: {
    variant: {
      default: 'flex flex-col gap-y-1.5 p-4 sm:px-6 sm:pt-6',
      featured: 'bg-base-200 border-b border-base-300 py-3 px-4 text-sm text-base-content/60',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type CardHeaderVariants = VariantProps<typeof cardHeaderVariants>

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: CardHeaderVariants['variant']
}>()
</script>

<template>
  <div :class="cn(cardHeaderVariants({ variant }), props.class)">
    <slot />
  </div>
</template>
