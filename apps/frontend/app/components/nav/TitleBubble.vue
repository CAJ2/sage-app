<template>
  <div
    class="fixed top-[calc(env(safe-area-inset-top)+1.25rem)] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-base-200/80 px-4 py-2 shadow-sm backdrop-blur-sm transition-transform active:scale-95"
  >
    <slot name="icon" />
    <div class="flex flex-col items-center text-center">
      <p class="line-clamp-1 text-xs font-bold opacity-80">{{ title }}</p>
      <p v-if="subtitle" class="line-clamp-1 text-[10px] leading-none opacity-50">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>
