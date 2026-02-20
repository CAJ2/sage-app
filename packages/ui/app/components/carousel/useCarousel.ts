import { createInjectionState } from '@vueuse/core'
import emblaCarouselVue from 'embla-carousel-vue'
import { onMounted, ref } from 'vue'

import type { UnwrapRefCarouselApi as CarouselApi, CarouselEmits, CarouselProps } from './interface'

const [useProvideCarousel, useInjectCarousel] = createInjectionState(
  ({ opts, orientation, plugins }: CarouselProps, emits: CarouselEmits) => {
    const [emblaNode, emblaApi] = emblaCarouselVue(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins,
    )

    function goToPrev() {
      emblaApi.value?.goToPrev()
    }
    function goToNext() {
      emblaApi.value?.goToNext()
    }

    const canGoToNext = ref(false)
    const canGoToPrev = ref(false)

    function onSelect(api: CarouselApi) {
      canGoToNext.value = api?.canGoToNext() || false
      canGoToPrev.value = api?.canGoToPrev() || false
    }

    onMounted(() => {
      if (!emblaApi.value) return

      emblaApi.value?.on('slidesinview', onSelect)
      emblaApi.value?.on('reinit', onSelect)
      emblaApi.value?.on('select', onSelect)

      emits('init-api', emblaApi.value)
    })

    return {
      carouselRef: emblaNode,
      carouselApi: emblaApi,
      canGoToPrev,
      canGoToNext,
      goToPrev,
      goToNext,
      orientation,
    }
  },
)

function useCarousel() {
  const carouselState = useInjectCarousel()

  if (!carouselState) throw new Error('useCarousel must be used within a <Carousel />')

  return carouselState
}

export { useCarousel, useProvideCarousel }
