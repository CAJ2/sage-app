<template>
  <div :class="cn('flex items-center justify-center p-1', props.class)">
    <NuxtPicture
      v-if="src && srcType === 'img'"
      :src="src"
      :alt="alt"
      :fit="fit"
      placeholder
      :img-attrs="{ class: 'object-contain', style: widthHeightStyle }"
    />
    <Icon
      v-if="src && srcType === 'icon'"
      :name="iconName"
      :alt="alt"
      :style="iconStyle"
      :customize="iconCustomize"
    />
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
    const raw = props.src.replace('icon://', '').split('?')[0] ?? ''
    return raw.replace('/', ':')
  }
  return props.src || ''
})

const iconStyle = computed(() => ({
  width: props.width ? `${props.width * 0.25}rem` : '100%',
  height: props.height ? `${props.height * 0.25}rem` : '100%',
}))

const iconCustomize = computed(() => {
  if (!props.src?.startsWith('icon://')) return
  const colorParam = new URLSearchParams(props.src.split('?')[1] ?? '').get('color')
  if (!colorParam) return

  const colors = colorParam.split(',').map((c) => `#${c}`)

  return (content: string) => {
    if (colors.length === 1) {
      return content
        .replaceAll(/fill="(?!none)[^"]*"/g, `fill="${colors[0]}"`)
        .replaceAll(/stroke="(?!none)[^"]*"/g, `stroke="${colors[0]}"`)
    }
    // Multi-color: map unique fill/stroke values in order of first appearance
    const seen: string[] = []
    content.replaceAll(/(?:fill|stroke)="([^"]+)"/g, (_, color) => {
      if (color !== 'none' && !seen.includes(color)) seen.push(color)
      return _
    })
    return seen.reduce((result, color, i) => {
      if (i >= colors.length) return result
      return result
        .replaceAll(`fill="${color}"`, `fill="${colors[i]}"`)
        .replaceAll(`stroke="${color}"`, `stroke="${colors[i]}"`)
    }, content)
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
