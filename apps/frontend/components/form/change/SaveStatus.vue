<template>
  <Alert
    :class="{
      'border-accent': status === 'saved',
      'border-warning': status === 'saving',
      'border-error': status === 'error',
    }"
  >
    <AlertTitle>
      <div
        class="flex items-center justify-center space-x-2"
        :class="{
          'text-accent': status === 'saved',
          'text-warning': status === 'saving',
          'text-error': status === 'error',
        }"
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
  status: 'saved' | 'saving' | 'error'
}>()

const statusFmt = computed(() => {
  switch (status) {
    case 'saved':
      return 'Saved'
    case 'saving':
      return 'Saving...'
    case 'error':
      return 'Error saving'
    default:
      return ''
  }
})
</script>
