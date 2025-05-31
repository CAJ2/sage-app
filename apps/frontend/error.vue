<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps<{
  error?: NuxtError | (() => NuxtError)
}>()
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="text-center mt-6">
        <h1 class="text-4xl font-bold mb-4">Oops!</h1>
        <p class="text-lg mb-8">
          An error occurred while processing your request.
        </p>
        <h1 class="text-2xl font-bold mb-4">
          {{ isNuxtError(error) ? error.statusCode : error?.().statusCode }}
        </h1>
        <NuxtLink to="/" class="btn btn-primary">Go back home</NuxtLink>
      </div>
    </NuxtLayout>
  </div>
</template>
