<template>
  <div class="flex justify-between items-center bg-base-200 p-2">
    <button v-if="back" class="btn btn-ghost mx-1" @click.prevent="goBack">
      <font-awesome-icon icon="fa-solid fa-angle-left" class="w-5 min-h-5" />
    </button>
    <div v-if="useImage" class="flex items-center mr-2">
      <img
        v-if="image"
        :src="image"
        class="w-10 h-10 rounded-full bg-base-100"
      />
      <font-awesome-icon
        v-if="!image"
        icon="fa-solid fa-tags"
        class="w-6 h-6! pt-1 text-neutral-700 dark:text-neutral-300"
      />
    </div>
    <div class="flex-1 flex flex-col">
      <h2
        class="text-xl m-3 font-bold text-base-content line-clamp-1"
        :class="{ 'my-0': !!subtitle }"
      >
        {{ title }}
      </h2>
      <h4 v-if="subtitle" class="text-xs text-base-content mx-3">
        {{ subtitle }}
      </h4>
    </div>
    <button v-if="context" class="btn btn-ghost mx-3">
      <font-awesome-icon
        icon="fa-solid fa-ellipsis-vertical"
        class="w-5 min-h-5"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const { title, subtitle, back, context, useImage, image } = defineProps<{
  title: string
  subtitle?: string
  back?: string
  context?: boolean
  useImage?: boolean
  image?: string
}>()

function goBack() {
  // TODO: This is a terrible hack and only works for this case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(router.options as unknown as any).is_back = true
  router.back()
}
</script>
