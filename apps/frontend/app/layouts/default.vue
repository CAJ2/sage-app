<template>
  <div>
    <div class="mb-22.5">
      <slot />
    </div>
    <div class="relative">
      <div class="fixed right-0 bottom-0 left-0 z-50">
        <NavTabs />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
