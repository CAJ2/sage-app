<script setup lang="ts">
import type { CarouselEmits, CarouselProps, WithClassAsProps } from './interface'
import { cn } from '../lib/utils'
import { useProvideCarousel } from './useCarousel'

const props = withDefaults(defineProps<CarouselProps & WithClassAsProps>(), {
  orientation: 'horizontal',
})

const emits = defineEmits<CarouselEmits>()

const { canGoToNext, canGoToPrev, carouselApi, carouselRef, orientation, goToNext, goToPrev } =
  useProvideCarousel(props, emits)

defineExpose({
  canGoToNext,
  canGoToPrev,
  carouselApi,
  carouselRef,
  orientation,
  goToNext,
  goToPrev,
})

function onKeyDown(event: KeyboardEvent) {
  const prevKey = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'

  if (event.key === prevKey) {
    event.preventDefault()
    goToPrev()

    return
  }

  if (event.key === nextKey) {
    event.preventDefault()
    goToNext()
  }
}
</script>

<template>
  <div
    :class="cn('relative', props.class)"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <slot
      :can-go-to-next
      :can-go-to-prev
      :carousel-api
      :carousel-ref
      :orientation
      :go-to-next
      :go-to-prev
    />
  </div>
</template>
