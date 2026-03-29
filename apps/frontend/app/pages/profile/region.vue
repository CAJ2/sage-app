<template>
  <div>
    <div class="flex grow items-center justify-center p-6 lg:p-10">
      <SettingsRegionSelect class="mb-4 w-full max-w-2xl" />
    </div>
  </div>
</template>

<script setup lang="ts">
useTopbar({ title: 'Change Region', back: 'true' })
</script>
