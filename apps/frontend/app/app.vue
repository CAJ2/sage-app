<template>
  <div style="overflow: hidden">
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
/* ─── Shared active state ─────────────────────────────────────── */

.page-left-enter-active,
.page-left-leave-active,
.page-right-enter-active,
.page-right-leave-active {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition:
    transform 320ms cubic-bezier(0.25, 0.1, 0.25, 1),
    opacity 320ms cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform, opacity;
}

/* ─── Forward navigation (page-left) ─────────────────────────── */

.page-left-enter-active {
  z-index: 10;
  box-shadow: -6px 0 24px rgba(0, 0, 0, 0.18);
}
.page-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.page-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.page-left-leave-active {
  z-index: 1;
}
.page-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.page-left-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}

/* ─── Back navigation (page-right) ───────────────────────────── */

.page-right-enter-active {
  z-index: 1;
}
.page-right-enter-from {
  transform: translateX(-30%);
  opacity: 0;
}
.page-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.page-right-leave-active {
  z-index: 10;
  box-shadow: -6px 0 24px rgba(0, 0, 0, 0.18);
}
.page-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.page-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* ─── Cross-tab fade ──────────────────────────────────────────── */

.page-fade-enter-active,
.page-fade-leave-active {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: opacity 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: opacity;
}
.page-fade-enter-active {
  z-index: 10;
}
.page-fade-leave-active {
  z-index: 1;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
.page-fade-enter-to,
.page-fade-leave-from {
  opacity: 1;
}
</style>
