<template>
  <div class="flex justify-between items-center bg-base-200 p-2">
    <button v-if="back" class="btn btn-ghost mx-1" @click.prevent="goBack">
      <font-awesome-icon icon="fa-solid fa-angle-left" class="w-5 min-h-5" />
    </button>
    <h2 class="flex-1 text-xl m-3 font-bold text-base-content">
      {{ title }}
    </h2>
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

const { title, back, context } = defineProps<{
  title: string
  back?: string
  context?: boolean
}>()

function goBack() {
  router.go(-1)
}
</script>
