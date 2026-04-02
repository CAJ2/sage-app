<template>
  <div class="relative h-[calc(100vh-90px)]">
    <div class="absolute inset-0">
      <SearchScannerNative v-if="isNative" @detected="onScanDetected" @frame="onScanFrame" />
      <SearchScannerQuagga v-else @detected="onScanDetected" />
    </div>
    <div class="absolute top-0 right-0 left-0 z-10 flex flex-col items-center gap-2 px-5 pt-5">
      <div class="grid w-full max-w-2xl grid-cols-2 rounded-lg bg-base-200/80 p-1 backdrop-blur-sm">
        <NuxtLink to="/search">
          <button class="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-sm">
            <SearchIcon :size="14" />
            Search
          </button>
        </NuxtLink>
        <NuxtLink to="/search/scan">
          <button
            class="flex w-full items-center justify-center gap-1.5 rounded-md bg-base-100 py-1.5 text-sm shadow"
          >
            <ScanBarcodeIcon :size="14" />
            Scan
          </button>
        </NuxtLink>
      </div>
      <button
        v-if="isDev && isNative"
        class="rounded bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white/70 backdrop-blur-sm"
        @click="debugOpen = true"
      >
        debug ({{ debugFrames.length }})
      </button>
    </div>

    <Drawer v-if="isDev" v-model:open="debugOpen">
      <DrawerContent class="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle>Scan frames</DrawerTitle>
          <DrawerDescription>Last {{ debugFrames.length }} detection events</DrawerDescription>
        </DrawerHeader>
        <div class="overflow-y-auto px-4 pb-6">
          <p v-if="debugFrames.length === 0" class="text-sm text-base-content/50">
            No frames yet. Point the camera at something.
          </p>
          <div v-for="(frame, i) in debugFrames" :key="i" class="mb-3 rounded bg-base-200 p-2">
            <pre class="overflow-x-auto font-mono text-[10px] break-all whitespace-pre-wrap">{{
              JSON.stringify({ ...frame, text: frame.text?.fullText ?? null }, null, 2)
            }}</pre>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
    <div
      v-if="scannedVariants.length"
      class="absolute inset-x-0 bottom-2 z-10 flex justify-center px-5"
    >
      <div class="w-full max-w-2xl">
        <SearchScanResults :variants="scannedVariants" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchIcon, ScanBarcodeIcon } from '@lucide/vue'
import type { ScanFrame } from '@sageleaf/scanleaf'
import { isTauri } from '@tauri-apps/api/core'

import type { ScanVariant } from '~/components/search/ScanResults.vue'

useTopbar(null)
useNavbar(false)

const isNative = isTauri()

const scanQuery = gql`
  query ScanSearch($query: String!) {
    search(query: $query, types: [VARIANT]) {
      nodes {
        __typename
        ... on Variant {
          id
          name
          desc
          imageURL
        }
      }
      totalCount
    }
  }
`

type ScanResult = {
  search: {
    nodes: ScanVariant[]
    totalCount: number
  }
}

const scannedCodes = ref(new Set<string>())
const scannedVariants = ref<ScanVariant[]>([])
const scanCode = ref('')

const { result: scanResult } = useQuery<ScanResult>(
  scanQuery,
  () => ({ query: scanCode.value }),
  () => ({ enabled: !!scanCode.value }),
)

watch(scanResult, (res) => {
  const variants = (res?.search.nodes ?? []) as ScanVariant[]
  for (const v of variants) {
    if (!scannedVariants.value.some((sv) => sv.id === v.id)) {
      scannedVariants.value.push(v)
    }
  }
})

const onScanDetected = (code: string) => {
  if (!code || scannedCodes.value.has(code)) return
  scannedCodes.value.add(code)
  scanCode.value = code
}

const isDev = import.meta.env.DEV
const debugOpen = ref(false)
const debugFrames = ref<ScanFrame[]>([])
const MAX_DEBUG_FRAMES = 20

const onScanFrame = (frame: ScanFrame) => {
  debugFrames.value.unshift(frame)
  if (debugFrames.value.length > MAX_DEBUG_FRAMES) {
    debugFrames.value.length = MAX_DEBUG_FRAMES
  }
}
</script>
