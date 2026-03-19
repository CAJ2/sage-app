<template>
  <h1 />
</template>

<script setup lang="ts">
const router = useRouter()

definePageMeta({
  alias: ['/'],
})

router.replace('/home')
</script>
