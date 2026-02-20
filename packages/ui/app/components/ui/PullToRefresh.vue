<template>
  <div
    ref="containerRef"
    class="v-pull-to-refresh"
    @touchstart="onTouchstart"
    @touchmove="onTouchmove"
    @touchend="onTouchend"
    @mousedown="onTouchstart"
    @mouseup="onTouchend"
    @mouseleave="onTouchend"
    @mousemove="onTouchmove"
  >
    <div
      class="v-pull-to-refresh__pull-down"
      :class="{ 'v-pull-to-refresh__pull-down--touching': touching }"
      :style="{
        top: convertToUnit(-1 * pullDownThreshold + topOffset, 'px'),
        height: convertToUnit(pullDownThreshold, 'px'),
      }"
    >
      <slot
        name="pullDownPanel"
        :can-refresh="canRefresh"
        :going-up="goingUp"
        :refreshing="refreshing"
      >
        <div class="v-pull-to-refresh__pull-down-default">
          <span v-if="refreshing" class="loading loading-spinner"></span>
          <font-awesome-icon
            v-else
            :icon="canRefresh || goingUp ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"
          />
        </div>
      </slot>
    </div>
    <div
      class="v-pull-to-refresh__scroll-container"
      :class="{ 'v-pull-to-refresh__scroll-container--touching': touching }"
      :style="{ top: convertToUnit(topOffset, 'px') }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}
function convertToUnit(str: string | number | null | undefined, unit = 'px'): string | undefined {
  if (str === null || str === '') {
    return undefined
  }
  const num = Number(str)
  if (isNaN(num)) {
    return String(str)
  } else if (!isFinite(num)) {
    return undefined
  }
  return `${num}${unit}`
}
function hasScrollbar(el?: Element | null) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false
  const style = window.getComputedStyle(el)
  return (
    style.overflowY === 'scroll' ||
    (style.overflowY === 'auto' && el.scrollHeight > el.clientHeight)
  )
}
function getScrollParents(el?: Element | null, stopAt?: Element | null) {
  const elements: HTMLElement[] = []
  if (stopAt && el && !stopAt.contains(el)) return elements
  while (el) {
    if (hasScrollbar(el)) elements.push(el as HTMLElement)
    if (el === stopAt) break
    el = el.parentElement!
  }
  return elements
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    pullDownThreshold?: number
  }>(),
  {
    disabled: false,
    pullDownThreshold: 64,
  },
)
const emit = defineEmits<{
  (e: 'load', options: { done: () => void }): void
}>()

let touchstartY = 0
let scrollParents: HTMLElement[] = []

const touchDiff = shallowRef(0)
const containerRef = ref<HTMLElement>()
const refreshing = shallowRef(false)
const goingUp = shallowRef(false)
const touching = shallowRef(false)

const canRefresh = computed(() => touchDiff.value >= props.pullDownThreshold && !refreshing.value)
const topOffset = computed(() => clamp(touchDiff.value, 0, props.pullDownThreshold))

function onTouchstart(e: TouchEvent | MouseEvent) {
  if (refreshing.value || props.disabled) return
  touching.value = true
  touchstartY = 'clientY' in e ? e.clientY : (e as TouchEvent).touches[0].clientY
}
function onTouchmove(e: TouchEvent | MouseEvent) {
  if (refreshing.value || !touching.value || props.disabled) return
  const touchY = 'clientY' in e ? e.clientY : (e as TouchEvent).touches[0].clientY
  if (scrollParents.length > 0 && !scrollParents[0].scrollTop) {
    touchDiff.value = touchY - touchstartY
  }
}
function onTouchend(_e: TouchEvent | MouseEvent) {
  if (refreshing.value || props.disabled) return
  touching.value = false
  if (canRefresh.value) {
    const done = () => {
      if (!refreshing.value) return
      touchDiff.value = 0
      refreshing.value = false
    }
    emit('load', { done })
    refreshing.value = true
  } else {
    touchDiff.value = 0
  }
}

onMounted(() => {
  scrollParents = getScrollParents(containerRef.value)
})

watch([topOffset, refreshing], () => {
  if (scrollParents.length > 0) {
    const stopScrolling = topOffset.value && !refreshing.value
    scrollParents.forEach((p) => (p.style.overflow = stopScrolling ? 'hidden' : 'auto'))
  }
})

watch(topOffset, (newVal, oldVal) => {
  goingUp.value = newVal < oldVal
})
</script>

<style scoped>
/* Add your styles here or copy from the original .tsx file's CSS */
</style>
