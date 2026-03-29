<template>
  <div
    class="fixed top-[calc(env(safe-area-inset-top)+0.75rem)] left-1/2 z-10 max-w-[60vw] -translate-x-1/2 rounded-full bg-base-100/80 px-4 py-2 shadow-md backdrop-blur-sm"
  >
    <p class="line-clamp-1 text-center text-sm leading-tight font-semibold">{{ title }}</p>
    <p v-if="subtitle" class="line-clamp-1 text-center text-xs leading-tight opacity-60">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>
