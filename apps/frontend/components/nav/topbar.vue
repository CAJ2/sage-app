<template>
  <div class="flex justify-between items-center bg-base-200 p-3">
    <button v-if="back" class="btn btn-ghost" @click.prevent="goBack">
      <font-awesome-icon icon="fa-solid fa-angle-left" class="w-8 h-8" />
    </button>
    <h3 class="text-lg font-bold text-base-content">
      {{ title }}
    </h3>
    <button v-if="context" class="btn btn-ghost">
      <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" class="w-8 h-8" />
    </button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const { title, back, context } = defineProps<{
  title: string
  back?: boolean
  context?: boolean
}>()

function goBack() {
  router.go(-1)
}
</script>
