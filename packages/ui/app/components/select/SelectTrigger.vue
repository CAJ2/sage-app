<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { ChevronsUpDown } from 'lucide-vue-next'
import { SelectIcon, SelectTrigger, type SelectTriggerProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '../lib/utils'

const props = withDefaults(
  defineProps<
    SelectTriggerProps & {
      class?: HTMLAttributes['class']
      size?: 'sm' | 'default'
    }
  >(),
  { size: 'default' },
)

const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-base-content/20 bg-base-200 py-2.5 pr-9 pl-4 text-sm text-nowrap text-base-content hover:bg-base-300 focus:bg-base-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[placeholder]:text-base-content/50',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon class="absolute top-1/2 right-3 -translate-y-1/2">
      <ChevronsUpDown class="size-3.5 shrink-0 text-base-content/50" />
    </SelectIcon>
  </SelectTrigger>
</template>
