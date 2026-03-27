<template>
  <div class="relative h-[calc(100vh-90px)]">
    <div class="absolute inset-0">
      <SearchScannerNative v-if="isNative" @detected="onScanDetected" />
      <SearchScannerQuagga v-else @detected="onScanDetected" />
    </div>
    <div class="absolute top-0 right-0 left-0 z-10 flex justify-center px-5 pt-5">
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
    </div>
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
import { isTauri } from '@tauri-apps/api/core'

import type { ScanVariant } from '~/components/search/ScanResults.vue'

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
</script>
