<template>
  <div class="sticky top-0 z-2 flex justify-center">
    <div class="w-fit bg-base-200">
      <div
        class="flex items-center justify-center space-x-2 rounded-lg px-4 py-1 shadow-sm"
        :class="colorClass.text + ' ' + colorClass.shadow + ' ' + colorClass.bg"
      >
        <component :is="iconComponent" class="text-xl" />
        <span v-if="status === 'saving'" class="loading loading-md loading-spinner"></span>
        <span class="text-lg">
          {{ statusFmt }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Loader2, TriangleAlert, X } from '@lucide/vue'

const { status } = defineProps<{
  status: 'saved' | 'saving' | 'not_saved' | 'error' | undefined
}>()

const statusFmt = computed(() => {
  switch (status) {
    case 'saved':
      return 'Saved'
    case 'saving':
      return 'Saving...'
    case 'not_saved':
      return 'Not saved'
    case 'error':
      return 'Error saving'
    default:
      return ''
  }
})

const colorClass = computed(() => {
  switch (status) {
    case 'saved':
      return {
        text: 'text-accent',
        border: 'border-accent',
        shadow: 'shadow-accent',
        bg: 'bg-accent/10',
      }
    case 'saving':
      return {
        text: 'text-warning',
        border: 'border-warning',
        shadow: 'shadow-warning',
        bg: 'bg-warning/10',
      }
    case 'not_saved':
      return {
        text: 'text-warning',
        border: 'border-warning',
        shadow: 'shadow-warning',
        bg: 'bg-warning/10',
      }
    case 'error':
      return {
        text: 'text-error',
        border: 'border-error',
        shadow: 'shadow-error',
        bg: 'bg-error/10',
      }
    default:
      return {
        text: 'text-neutral-500',
        border: 'border-neutral-500',
        shadow: 'shadow-neutral-500',
        bg: 'bg-neutral-500/10',
      }
  }
})

const iconComponent = computed(() => {
  switch (status) {
    case 'saved':
      return Check
    case 'saving':
      return Loader2
    case 'not_saved':
      return TriangleAlert
    case 'error':
      return X
    default:
      return null
  }
})
</script>
