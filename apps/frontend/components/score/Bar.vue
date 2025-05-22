<script setup lang="ts">
import {
  ProgressIndicator,
  ProgressRoot,
  PopoverAnchor,
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
} from 'reka-ui'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const { score } = defineProps<{
  score?: number
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
</script>

<template>
  <PopoverRoot :open="openPopover">
    <ProgressRoot
      v-model="progressValue"
      class="rounded-full relative mt-10 h-4 overflow-hidden bg-white dark:bg-stone-950 border border-muted"
    >
      <PopoverAnchor class="w-full" as-child>
        <ProgressIndicator
          ref="indicator"
          class="indicator rounded-full block relative w-full h-full bg-primary transition-transform overflow-hidden duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)] after:animate-progress after:content-[''] after:absolute after:inset-0 after:bg-[length:30px_30px]"
          :style="`transform: translateX(-${100 - progressValue}%)`"
        />
        <span class="relative h-4"></span>
      </PopoverAnchor>
    </ProgressRoot>
    <PopoverPortal>
      <PopoverContent
        side="top"
        :align="'end'"
        :align-offset="0"
        :side-offset="5"
        :disable-outside-pointer-events="true"
        class="rounded-lg p-1 bg-white shadow-sm border will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
      >
        <PopoverArrow
          class="fill-neutral-700 dark:fill-white stroke-gray-200"
        />
        {{ progressValue }}%
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
