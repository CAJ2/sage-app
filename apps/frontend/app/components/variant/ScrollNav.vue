<template>
  <div class="scrollbar-hide flex overflow-x-auto border-b border-base-300">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="flex-shrink-0 px-5 py-3 text-sm font-medium transition-colors"
      :class="
        tab.id === modelValue
          ? 'border-b-2 border-accent text-accent'
          : 'text-base-content/60 hover:text-base-content'
      "
      @click="emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: { id: string; label: string }[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
