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
    <Icon v-if="src && srcType === 'icon'" :name="iconName" :alt="alt" :style="iconStyle" />
    <div
      v-if="!src || srcType === 'unknown'"
      class="h-full w-full shrink-0 skeleton rounded-xl"
      :class="{
        'animate-none': srcType === 'unknown',
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../lib/utils'

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
  } else if (props.src.startsWith('icon://')) {
    return 'icon'
  }
  return 'unknown'
})

const iconName = computed(() => {
  if (props.src && props.src.startsWith('icon://')) {
    return props.src.replace('icon://', '').split('?')[0]
  }
  return props.src || ''
})

const iconStyle = computed(() => {
  if (props.src && props.src.startsWith('icon://')) {
    const style: Record<string, string | null> = {
      width: props.width ? `${props.width * 0.25}rem` : '100%',
      height: props.height ? `${props.height * 0.25}rem` : '100%',
    }
    const params = new URLSearchParams(props.src.split('?')[1])
    if (params.has('color')) {
      style.color = '#' + params.get('color')
    }
    return style
  }
  return {
    width: props.width ? `${props.width * 0.25}rem` : '100%',
    height: props.height ? `${props.height * 0.25}rem` : '100%',
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
  return {
    width: '100%',
    height: '100%',
  }
})
</script>
