<template>
  <Alert :class="colorClass.border">
    <AlertTitle>
      <div
        class="flex items-center justify-center space-x-2"
        :class="colorClass.text"
      >
        <font-awesome-icon
          v-if="status === 'saved'"
          icon="fa-solid fa-check"
          class="text-xl"
        />
        <span
          v-if="status === 'saving'"
          class="loading loading-spinner loading-md"
        ></span>
        <span class="ml-2 text-lg">
          {{ statusFmt }}
        </span>
      </div>
    </AlertTitle>
  </Alert>
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
      return { text: 'text-accent', border: 'border-accent' }
    case 'saving':
      return { text: 'text-warning', border: 'border-warning' }
    case 'not_saved':
      return { text: 'text-warning', border: 'border-warning' }
    case 'error':
      return { text: 'text-error', border: 'border-error' }
    default:
      return { text: 'text-neutral-500', border: 'border-neutral-500' }
  }
})
</script>
