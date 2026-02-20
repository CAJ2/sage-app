<script setup lang="ts">
import type { WithClassAsProps } from './interface'
import { ArrowRight } from 'lucide-vue-next'
import { cn } from '../lib/utils'
import { useCarousel } from './useCarousel'

const props = defineProps<WithClassAsProps>()

const { orientation, canGoToNext, goToNext } = useCarousel()
</script>

<template>
  <Button
    :disabled="!canGoToNext"
    :class="
      cn(
        'absolute h-8 w-8 touch-manipulation rounded-full p-0',
        orientation === 'horizontal'
          ? 'top-1/2 -right-12 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        props.class,
      )
    "
    variant="outline"
    @click="goToNext"
  >
    <slot>
      <ArrowRight class="h-4 w-4 text-current" />
      <span class="sr-only">Next Slide</span>
    </slot>
  </Button>
</template>
