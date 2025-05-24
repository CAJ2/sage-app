<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
import { useDark } from '@vueuse/core'
useHead({
  title: 'Sage',
  meta: [{ name: 'description', content: 'Circular economy information.' }],
})
useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})
</script>

<style>
.page-left-enter-active,
.page-right-enter-active,
.page-left-leave-active,
.page-right-leave-active {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: all 0.15s;
}
.page-left-enter-from,
.page-right-leave-to {
  transform: translateX(100%);
}

.page-right-enter-from,
.page-left-leave-to {
  transform: translateX(-100%);
}

.page-left-enter-to,
.page-right-enter-to {
  transform: translateX(0);
}
</style>
