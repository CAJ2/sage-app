<template>
  <div v-if="recycle.stream && recycle.stream.container" class="m-3">
    <Card>
      <CardHeader class="p-4 pb-2 items-center">
        <CardTitle class="text-md text-center mb-3">{{
          recycle.stream.name
        }}</CardTitle>
        <div class="relative">
          <img
            v-if="recycle.stream.container.image"
            ref="containerImage"
            :src="recycle.stream.container.image"
          />
          <img
            v-if="recycle.stream.container.image"
            ref="compImage"
            :src="image || ''"
            class="absolute w-15 h-15 rounded-xl border-2"
            :style="{
              top: `${compPercs.y}%`,
              left: `${compPercs.x}%`,
              'border-color': recycle.stream.container.color || '#000',
            }"
          />
        </div>
      </CardHeader>
      <CardContent class="flex flex-col justify-center px-4 pb-3">
        <span class="text-xs line-clamp-3">{{ recycle.stream.desc }}</span>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import type { ComponentRecycle } from '~/gql/types.generated'

const { image, recycle } = defineProps<{
  image?: string | null
  recycle: ComponentRecycle
}>()

const containerImage = useTemplateRef<HTMLImageElement>('containerImage')
const compImage = useTemplateRef<HTMLImageElement>('compImage')
const containerDims = useElementSize(containerImage)
const compDims = useElementSize(compImage)

const compPercs = computed(() => {
  if (!containerDims.width || !containerDims.height) return { x: 0, y: 0 }
  if (!recycle?.stream?.container?.image_entry_point) return { x: 0, y: 0 }
  return {
    x:
      recycle.stream.container.image_entry_point.x -
      (compDims.width.value / containerDims.width.value) * 50,
    y:
      recycle.stream.container.image_entry_point.y -
      (compDims.height.value / containerDims.height.value) * 50,
  }
})
</script>
