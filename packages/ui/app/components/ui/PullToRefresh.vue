// Adapted from
https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/labs/VPullToRefresh/VPullToRefresh.tsx
// licensed under MIT
<template>
  <div
    ref="containerRef"
    class="v-pull-to-refresh"
    @mousedown="onMousedown"
    @mouseup="onMouseup"
    @mouseleave="onMouseup"
    @mousemove="onMousemove"
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
          <ArrowDown v-if="!refreshing && !canRefresh && !goingUp" />
          <ArrowUp v-if="!refreshing && (canRefresh || goingUp)" />
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
import { ArrowDown, ArrowUp } from 'lucide-vue-next'

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
// Plain (non-reactive) flag — avoids any Vue reactivity timing issues
let isPulling = false

const touchDiff = shallowRef(0)
const containerRef = ref<HTMLElement>()
const refreshing = shallowRef(false)
const goingUp = shallowRef(false)
const touching = shallowRef(false)

const canRefresh = computed(() => touchDiff.value >= props.pullDownThreshold && !refreshing.value)
const topOffset = computed(() => clamp(touchDiff.value, 0, props.pullDownThreshold))

function getScrollTop() {
  return scrollParents.length > 0
    ? scrollParents[0]!.scrollTop
    : document.documentElement.scrollTop || document.body.scrollTop
}

function triggerRefresh() {
  const done = () => {
    if (!refreshing.value) return
    touchDiff.value = 0
    refreshing.value = false
  }
  emit('load', { done })
  refreshing.value = true
}

// ── Touch event handlers (registered manually with { passive: false }) ──────

function onTouchstart(e: TouchEvent) {
  if (refreshing.value || props.disabled || e.touches.length === 0) return
  if (getScrollTop() > 0) return
  isPulling = true
  touching.value = true
  touchstartY = e.touches[0]!.clientY
}

function onTouchmove(e: TouchEvent) {
  if (!isPulling || refreshing.value || props.disabled || e.touches.length === 0) return
  const diff = e.touches[0]!.clientY - touchstartY
  if (diff > 0) {
    e.preventDefault()
    touchDiff.value = diff
  }
}

function onTouchend() {
  if (!isPulling) return
  isPulling = false
  touching.value = false
  if (canRefresh.value) {
    triggerRefresh()
  } else {
    touchDiff.value = 0
  }
}

function onTouchcancel() {
  isPulling = false
  touching.value = false
  touchDiff.value = 0
}

// ── Mouse event handlers (for desktop / DevTools emulation) ─────────────────

function onMousedown(e: MouseEvent) {
  if (refreshing.value || props.disabled) return
  if (getScrollTop() > 0) return
  isPulling = true
  touching.value = true
  touchstartY = e.clientY
}

function onMousemove(e: MouseEvent) {
  if (!isPulling || refreshing.value || props.disabled) return
  const diff = e.clientY - touchstartY
  if (diff > 0) {
    touchDiff.value = diff
  }
}

function onMouseup() {
  if (!isPulling) return
  isPulling = false
  touching.value = false
  if (canRefresh.value) {
    triggerRefresh()
  } else {
    touchDiff.value = 0
  }
}

onMounted(() => {
  scrollParents = getScrollParents(containerRef.value)
  const el = containerRef.value
  if (!el) return
  el.addEventListener('touchstart', onTouchstart, { passive: false })
  el.addEventListener('touchmove', onTouchmove, { passive: false })
  el.addEventListener('touchend', onTouchend)
  el.addEventListener('touchcancel', onTouchcancel)
})

onUnmounted(() => {
  const el = containerRef.value
  if (!el) return
  el.removeEventListener('touchstart', onTouchstart)
  el.removeEventListener('touchmove', onTouchmove)
  el.removeEventListener('touchend', onTouchend)
  el.removeEventListener('touchcancel', onTouchcancel)
})

watch([topOffset, refreshing], () => {
  const stopScrolling = topOffset.value > 0 && !refreshing.value
  if (scrollParents.length > 0) {
    scrollParents.forEach((p) => (p.style.overflow = stopScrolling ? 'hidden' : 'auto'))
  } else {
    document.documentElement.style.overflow = stopScrolling ? 'hidden' : ''
    document.body.style.overflow = stopScrolling ? 'hidden' : ''
  }
})

watch(topOffset, (newVal, oldVal) => {
  goingUp.value = newVal < oldVal
})
</script>

<style scoped>
.v-pull-to-refresh {
  overflow: hidden;
  position: relative;
  min-height: 100%;
  overscroll-behavior-y: contain;
}

.v-pull-to-refresh__pull-down {
  position: absolute;
  width: 100%;
  transition: top 0.3s ease-out;
}

.v-pull-to-refresh__pull-down--touching {
  transition: none;
}

.v-pull-to-refresh__pull-down-default {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10px;
}

.v-pull-to-refresh__scroll-container {
  position: relative;
  transition: top 0.3s ease-out;
}

.v-pull-to-refresh__scroll-container--touching {
  transition: none;
}
</style>
