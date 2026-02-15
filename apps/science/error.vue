<script setup lang="ts">
import type { NuxtError } from '#app'
import { isNuxtError } from '#app'

const { error } = defineProps<{
  error?: NuxtError | (() => NuxtError)
}>()
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="mt-6 text-center">
        <h1 class="mb-4 text-4xl font-bold">Oops!</h1>
        <p class="mb-8 text-lg">An error occurred while processing your request.</p>
        <h1 class="mb-4 text-2xl font-bold">
          {{ isNuxtError(error) ? error.statusCode : error?.().statusCode }}
        </h1>
        <NuxtLinkLocale to="/" class="btn btn-primary">Go back home</NuxtLinkLocale>
      </div>
    </NuxtLayout>
  </div>
</template>
