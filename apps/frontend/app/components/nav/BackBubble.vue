<template>
  <button
    class="fixed top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-base-100/80 shadow-md backdrop-blur-sm"
    aria-label="Go back"
    @click.prevent="goBack"
  >
    <ChevronLeft :size="20" />
  </button>
</template>

<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'

const router = useRouter()

const { back } = defineProps<{
  back?: string
}>()

function goBack() {
  // TODO: This is a terrible hack and only works for this case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(router.options as unknown as any).is_back = true

  if (back?.startsWith('/')) {
    navigateTo(back)
  } else {
    router.back()
  }
}
</script>
