<template>
  <div>
    <div :class="{ android: isAndroid }">
      <slot />
    </div>
    <div class="relative">
      <div class="fixed bottom-0 left-0 right-0">
        <NavTabs></NavTabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core'

const isAndroid = Capacitor.getPlatform() === 'android'
</script>
