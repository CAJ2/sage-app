<template>
  <div class="sticky top-0 z-2 flex justify-center">
    <div class="bg-base-200 w-fit">
      <div
        class="flex items-center justify-center space-x-2 py-1 px-4 rounded-lg shadow-sm"
        :class="colorClass.text + ' ' + colorClass.shadow + ' ' + colorClass.bg"
      >
        <font-awesome-icon :icon="iconClass" class="text-xl" />
        <span
          v-if="status === 'saving'"
          class="loading loading-spinner loading-md"
        ></span>
        <span class="text-lg">
          {{ statusFmt }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const iconClass = computed(() => {
  switch (status) {
    case 'saved':
      return 'fa-solid fa-check'
    case 'saving':
      return 'fa-solid fa-spinner'
    case 'not_saved':
      return 'fa-solid fa-exclamation-triangle'
    case 'error':
      return 'fa-solid fa-xmark'
    default:
      return ''
  }
})
</script>
