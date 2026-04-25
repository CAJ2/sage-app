<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import type { Component } from 'vue'

const props = defineProps<{
  modelValue: string
  tabs: {
    id: string
    label: string
    icon: Component
  }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const tabContainer = ref<HTMLElement | null>(null)
const tabRefs = reactive<Record<string, HTMLElement | null>>({})

const activeTab = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const scrollToActiveTab = () => {
  const el = tabRefs[activeTab.value]
  if (el && tabContainer.value) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
}

watch(activeTab, () => {
  scrollToActiveTab()
})

onMounted(() => {
  nextTick(() => {
    scrollToActiveTab()
  })
})
</script>

<template>
  <div class="flex-1 overflow-hidden">
    <div
      ref="tabContainer"
      class="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
      style="
        mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        -webkit-mask-image: linear-gradient(
          to right,
          transparent,
          black 15%,
          black 85%,
          transparent
        );
      "
    >
      <div class="flex shrink-0 gap-2 px-[40%] py-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :ref="(el) => (tabRefs[tab.id] = el as HTMLElement)"
          :class="[
            'flex shrink-0 snap-center items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all',
            activeTab === tab.id
              ? 'bg-primary text-primary-content shadow-md'
              : 'text-base-content/60 hover:bg-base-200',
          ]"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="size-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
