<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { Check } from 'lucide-vue-next'
import {
  SelectItem,
  SelectItemIndicator,
  type SelectItemProps,
  SelectItemText,
  useForwardProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '../lib/utils'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        `flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-base-content select-none hover:bg-base-200 focus:bg-base-200 focus:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-base-200 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        props.class,
      )
    "
  >
    <SelectItemText class="flex-1 data-[state=checked]:font-semibold">
      <slot />
    </SelectItemText>

    <span class="ms-auto flex size-4 items-center justify-center">
      <SelectItemIndicator>
        <Check class="size-4 text-primary" />
      </SelectItemIndicator>
    </span>
  </SelectItem>
</template>
