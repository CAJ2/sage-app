<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { SwitchRoot, type SwitchRootProps, SwitchThumb, useForwardProps } from 'reka-ui'
import { cn } from '../lib/utils'

const props = defineProps<SwitchRootProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SwitchRoot
    v-bind="forwardedProps"
    :class="
      cn(
        'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-base-300 transition-colors disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-primary',
        props.class,
      )
    "
  >
    <SwitchThumb
      class="size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-full"
    />
  </SwitchRoot>
</template>
