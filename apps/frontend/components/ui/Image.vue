<template>
  <div :class="cn('p-1', props.class)">
    <NuxtPicture
      v-if="src && srcType === 'img'"
      :src="src"
      :alt="alt"
      :fit="fit"
      placeholder
      :img-attrs="{ class: 'object-contain', style: widthHeightStyle }"
    />
    <iconify-icon
      v-if="src && srcType === 'icon'"
      :icon="src.replace('iconify://', '')"
      :alt="alt"
      :style="widthHeightStyle"
      :width="'100%'"
      :height="'100%'"
    />
    <div
      v-if="!src || srcType === 'unknown'"
      class="skeleton h-full w-full shrink-0 rounded-xl"
    ></div>
  </div>
</template>

<script setup lang="ts">
import 'iconify-icon'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  src?: string | null
  alt?: string
  height?: number
  width?: number
  class?: HTMLAttributes['class']
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}>()

const srcType = computed(() => {
  if (!props.src) {
    return 'unknown'
  }
  if (props.src.startsWith('http')) {
    return 'img'
  } else if (props.src.startsWith('iconify://')) {
    return 'icon'
  } else {
    return 'unknown'
  }
})

const widthHeightStyle = computed(() => {
  if (props.width && !props.height) {
    return { width: `${props.width * 0.25}rem` }
  }
  if (!props.width && props.height) {
    return { height: `${props.height * 0.25}rem` }
  }
  if (props.width && props.height) {
    return {
      width: `${props.width * 0.25}rem`,
      height: `${props.height * 0.25}rem`,
    }
  }
  return {}
})
</script>
