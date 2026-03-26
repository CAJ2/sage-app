<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import type { HTMLAttributes } from 'vue'

import { cn } from '../lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  state?: 'error' | 'success'
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input
    v-model="modelValue"
    :class="
      cn(
        'block w-full rounded-lg border border-base-content/20 bg-base-200 px-4 py-2.5 text-base-content placeholder:text-base-content/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm',
        state === 'error' && 'border-error focus:border-error focus:ring-error',
        state === 'success' && 'border-success focus:border-success focus:ring-success',
        props.class,
      )
    "
  />
</template>
