<script setup lang="ts">
import type { ImgHTMLAttributes } from 'vue'

import { cn } from '../lib/utils'

const props = defineProps<{
  src: string
  alt?: string
  class?: ImgHTMLAttributes['class']
}>()
</script>

<template>
  <img :src="src" :alt="alt ?? ''" :class="cn('h-auto w-full object-cover', props.class)" />
</template>
