<template>
  <div>
    <div ref="topbarWrapper">
      <div
        v-if="!topbar.visible"
        class="h-[env(safe-area-inset-top)] bg-base-200"
        aria-hidden="true"
      />
      <NavTopbar
        v-else
        :title="topbar.title"
        :subtitle="topbar.subtitle"
        :back="topbar.back"
        :context="topbar.context"
        :use-image="topbar.useImage"
        :image="topbar.image"
        :loading="topbar.loading"
      />
    </div>
    <div :class="navbarVisible ? 'mb-[calc(5.625rem+env(safe-area-inset-bottom))]' : ''">
      <slot />
    </div>
    <div v-if="navbarVisible" class="relative">
      <div class="fixed right-0 bottom-0 left-0 z-50">
        <NavTabs />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const navbarVisible = useState<boolean>('navbar', () => true)

const topbar = useState<{
  visible: boolean
  title?: string
  subtitle?: string
  back?: string
  context?: boolean
  useImage?: boolean
  image?: string
  loading?: boolean
}>('topbar', () => ({ visible: false }))

const topbarWrapper = useTemplateRef('topbarWrapper')

onMounted(() => {
  const el = topbarWrapper.value as HTMLElement | null
  if (!el) return
  const update = () =>
    document.documentElement.style.setProperty('--topbar-h', `${el.offsetHeight}px`)
  update()
  const ro = new ResizeObserver(update)
  ro.observe(el)
  onUnmounted(() => ro.disconnect())
})
</script>
