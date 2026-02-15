<template>
  <div class="sticky top-0 z-1 flex items-center justify-between bg-base-200 p-2">
    <button v-if="back" class="btn ml-1 btn-ghost" @click.prevent="goBack">
      <font-awesome-icon icon="fa-solid fa-angle-left" class="min-h-5 w-5" />
    </button>
    <div v-if="useImage" class="mx-2 flex items-center">
      <img v-if="image" :src="image" class="h-10 w-10 rounded-full bg-base-100" />
      <font-awesome-icon
        v-if="!image"
        :icon="icon || 'fa-solid fa-image'"
        class="h-6! w-6 pt-1 text-neutral-700 dark:text-neutral-300"
      />
    </div>
    <div class="flex flex-1 flex-col">
      <h2
        class="m-3 line-clamp-1 text-xl font-bold text-base-content"
        :class="{ 'my-1': !!subtitle }"
      >
        {{ title }}
      </h2>
      <h4
        v-if="subtitle"
        class="mx-3 line-clamp-1 text-xs text-base-content"
        :class="{ 'mb-1': !!subtitle }"
      >
        {{ subtitle }}
      </h4>
    </div>
    <button v-if="context" class="btn mx-3 btn-ghost">
      <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" class="min-h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const { title, subtitle, back, context, useImage, image, icon } = defineProps<{
  title: string
  subtitle?: string
  back?: string
  context?: boolean
  useImage?: boolean
  image?: string
  icon?: string
}>()

const localeRoute = useLocaleRoute()

function goBack() {
  // TODO: This is a terrible hack and only works for this case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(router.options as unknown as any).is_back = true

  if (back?.startsWith('/')) {
    navigateTo(localeRoute(back))
  } else {
    router.back()
  }
}
</script>
