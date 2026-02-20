<script setup lang="ts">
import { ProgressIndicator, ProgressRoot, PopoverAnchor, PopoverRoot } from 'reka-ui'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const { size, score, scoreSlide, rating, ratingFmt } = defineProps<{
  size: 'small' | 'medium' | 'large'
  score?: number | null
  scoreSlide?: boolean | null
  rating?: 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT' | 'UNKNOWN' | null
  ratingFmt?: string | null
}>()

const progressValue = ref(0)
const timer = ref()
const openPopover = ref(false)

onMounted(() => {
  progressValue.value = score || 0
  timer.value = setTimeout(() => {
    openPopover.value = true
  }, 400)
})

onBeforeUnmount(() => {
  clearTimeout(timer.value)
})

const bgColor = computed(() => {
  switch (rating) {
    case 'POOR':
      return 'bg-error'
    case 'FAIR':
      return 'bg-warning'
    case 'GOOD':
      return 'bg-primary/60'
    case 'VERY_GOOD':
      return 'bg-primary/80'
    case 'EXCELLENT':
      return 'bg-primary'
    default:
      return 'bg-primary/80'
  }
})
</script>

<template>
  <PopoverRoot :open="openPopover">
    <span
      class="relative block w-full pb-2 text-center font-bold"
      :class="{
        'text-sm': size === 'small',
        'text-md': size === 'medium',
        'text-lg': size === 'large',
      }"
      :style="{
        transform: scoreSlide ? `translateX(-${100 - progressValue}%)` : '',
      }"
      >{{ progressValue + '%' + (ratingFmt ? ` - ${ratingFmt}` : '') }}</span
    >
    <ProgressRoot
      v-model="progressValue"
      class="relative overflow-hidden rounded-full border border-neutral bg-base-100"
      :class="{
        'h-2': size === 'small',
        'h-3': size === 'medium',
        'h-4': size === 'large',
      }"
    >
      <PopoverAnchor class="w-full" as-child>
        <ProgressIndicator
          ref="indicator"
          class="ease-[cubic-bezier(0.65, 0, 0.35, 1)] after:animate-progress indicator relative block h-full w-full overflow-hidden rounded-full transition-transform duration-[660ms] after:absolute after:inset-0 after:bg-[length:30px_30px] after:content-['']"
          :class="[bgColor]"
          :style="{
            transform: `translateX(-${100 - progressValue}%)`,
          }"
        />
        <span class="relative h-4"></span>
      </PopoverAnchor>
    </ProgressRoot>
  </PopoverRoot>
</template>
