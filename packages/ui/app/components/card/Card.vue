<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'vue'

import { cn } from '../lib/utils'

const cardVariants = cva(
  'flex flex-col bg-base-100 text-base-content border border-base-300 rounded-xl overflow-hidden shadow-sm',
  {
    variants: {
      variant: {
        default: '',
        accent: 'border-t-4 border-t-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type CardVariants = VariantProps<typeof cardVariants>

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: CardVariants['variant']
}>()
</script>

<template>
  <div :class="cn(cardVariants({ variant }), props.class)">
    <slot />
  </div>
</template>
