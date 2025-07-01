<template>
  <div v-if="recycle.stream && recycle.stream.container" class="m-3">
    <Card class="bg-base-200 shadow-lg">
      <CardHeader class="p-4 pb-2 items-center">
        <CardTitle class="text-md text-center mb-3">{{
          recycle.stream.name
        }}</CardTitle>
        <div class="px-3 pb-2 w-full">
          <ScoreBar
            size="small"
            :score="recycle.stream?.score?.score"
            :rating="recycle.stream?.score?.rating"
            :rating-fmt="recycle.stream?.score?.ratingF"
          ></ScoreBar>
        </div>
      </CardHeader>
      <CardContent class="flex flex-col justify-center items-center px-4 pb-3">
        <div
          class="relative max-w-[256px]"
          :style="{
            'margin-top': containerTopMargin,
          }"
        >
          <UiImage
            v-if="recycle.stream.container.image"
            ref="containerImage"
            :src="recycle.stream.container.image"
          />
          <div
            v-if="recycle.stream.container.image"
            ref="compImage"
            class="absolute border-2 rounded-xl bg-base-100 shadow-base-content shadow-md"
            :style="{
              top: `${compPercs.y}%`,
              left: `${compPercs.x}%`,
              'border-color': recycle.stream.container.color || '#000',
            }"
          >
            <UiImage :src="image || ''" :width="12" :height="12" />
          </div>
        </div>
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
  if (!compDims.width.value || !compDims.height.value) return { x: 0, y: 0 }
  if (!containerDims.width.value || !containerDims.height.value)
    return { x: 0, y: 0 }
  if (!recycle?.stream?.container?.imageEntryPoint) return { x: 0, y: 0 }
  return {
    x:
      recycle.stream.container.imageEntryPoint.x -
      (compDims.width.value / containerDims.width.value) * 50,
    y:
      recycle.stream.container.imageEntryPoint.y -
      (compDims.height.value / containerDims.height.value) * 50,
  }
})
const containerTopMargin = computed(() => {
  if (compPercs.value.y < 0) {
    return (-compPercs.value.y / 100) * containerDims.height.value + 'px'
  }
  return '0px'
})
</script>
