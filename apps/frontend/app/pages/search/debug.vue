<template>
  <div class="min-h-screen bg-base-100 pb-20">
    <div
      class="sticky top-0 z-10 flex items-center justify-between border-b bg-base-100/80 px-4 py-3 backdrop-blur-md"
    >
      <div class="flex items-center gap-3">
        <NuxtLink to="/search/scan" class="p-1">
          <ChevronLeftIcon :size="24" />
        </NuxtLink>
        <h1 class="text-lg font-bold">Search Debug Log</h1>
      </div>
      <button class="btn text-error btn-ghost btn-sm" @click="clearHistory">Clear</button>
    </div>

    <div class="p-4">
      <div v-if="history.length === 0" class="py-20 text-center text-base-content/50">
        No search history yet.
      </div>

      <div v-for="entry in history" :key="entry.id" class="mb-4 overflow-hidden rounded-lg border">
        <div
          class="flex items-center justify-between bg-base-200 px-3 py-2 font-mono text-xs"
          @click="toggle(entry.id)"
        >
          <div class="flex items-center gap-2">
            <span
              class="rounded px-1.5 py-0.5 text-[10px] text-white uppercase"
              :class="entry.queryType === 'barcode' ? 'bg-blue-500' : 'bg-purple-500'"
            >
              {{ entry.queryType }}
            </span>
            <span class="truncate font-bold">{{ entry.query }}</span>
          </div>
          <div class="flex items-center gap-3 opacity-60">
            <span>{{ new Date(entry.timestamp).toLocaleTimeString() }}</span>
            <ChevronDownIcon
              :size="14"
              class="transition-transform"
              :class="{ 'rotate-180': expanded.has(entry.id) }"
            />
          </div>
        </div>

        <div v-if="expanded.has(entry.id)" class="bg-base-100 p-3">
          <div class="mb-3">
            <p class="mb-1 text-[10px] font-bold uppercase opacity-50">Variables</p>
            <pre
              class="overflow-x-auto rounded bg-base-200 p-2 text-[10px] break-all whitespace-pre-wrap"
              >{{ JSON.stringify(entry.variables, null, 2) }}</pre
            >
          </div>

          <div v-if="entry.error" class="mb-3">
            <p class="mb-1 text-[10px] font-bold text-error uppercase">Error</p>
            <pre
              class="overflow-x-auto rounded border border-error/20 bg-error/5 p-2 text-[10px] break-all whitespace-pre-wrap text-error"
              >{{ JSON.stringify(entry.error, null, 2) }}</pre
            >
          </div>

          <div v-if="entry.result">
            <p class="mb-1 text-[10px] font-bold uppercase opacity-50">Result</p>
            <pre
              class="overflow-x-auto rounded bg-base-200 p-2 text-[10px] break-all whitespace-pre-wrap"
              >{{ JSON.stringify(entry.result, null, 2) }}</pre
            >
          </div>
          <div v-else-if="!entry.error" class="flex items-center gap-2 text-[10px] opacity-40">
            <span class="size-2 animate-pulse rounded-full bg-primary" />
            Waiting for result...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronDownIcon } from '@lucide/vue'

import { useScanDebug } from '~/composables/useScanDebug'

useTopbar(null)
useNavbar(false)

const { history, clearHistory } = useScanDebug()

const expanded = ref(new Set<string>())

function toggle(id: string) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}
</script>
