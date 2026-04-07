<template>
  <div class="fixed inset-0 z-50 overflow-hidden">
    <!-- Camera layer -->
    <div class="absolute inset-0">
      <SearchScannerNative
        v-if="isNative"
        ref="scanner"
        @detected="onScanDetected"
        @frame="onScanFrame"
      />
      <SearchScannerQuagga v-else @detected="onScanDetected" />
    </div>

    <!-- Rainbow scanning border -->
    <Transition name="rainbow">
      <div v-if="isSearching" class="scan-border pointer-events-none absolute inset-0">
        <div class="scan-border-spin" />
      </div>
    </Transition>

    <!-- Top nav: search/scan tab switcher + camera controls -->
    <div
      class="absolute top-0 right-0 left-0 z-10 flex flex-col items-center gap-2 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)]"
    >
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

      <!-- Camera controls + scanning status (native only) -->
      <div v-if="isNative" class="flex w-full max-w-2xl items-center justify-between">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95"
          @click="scanner?.pickImage()"
        >
          <ImageIcon :size="20" />
        </button>

        <!-- Scanning status / drawer toggle pill -->
        <button
          class="flex items-center gap-1.5 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm active:scale-95"
          @click="toggleResultsDrawer"
        >
          <ScanSearchIcon :size="14" />
          <span v-if="isSearching && !totalResultCount">Scanning…</span>
          <span v-else-if="totalResultCount">
            {{ totalResultCount }} result{{ totalResultCount !== 1 ? 's' : '' }}
          </span>
          <span v-else>Results</span>
          <span v-if="isSearching" class="size-2 animate-pulse rounded-full bg-primary" />
        </button>

        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95"
          @click="scanner?.flipCamera()"
        >
          <SwitchCameraIcon :size="20" />
        </button>
      </div>

      <button
        v-if="isDev && isNative"
        class="rounded bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white/70 backdrop-blur-sm"
        @click="debugOpen = true"
      >
        debug ({{ debugFrames.length }})
      </button>
    </div>

    <!-- Debug drawer (dev only) -->
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

    <!-- Results drawer (renders via portal at body level) -->
    <SearchScanResultsDrawer
      v-model:open="drawerOpen"
      v-model:active-snap="drawerSnap"
      :exact-matches="exactMatches"
      :possible-matches="possibleMatches"
    />
  </div>
</template>

<script setup lang="ts">
import {
  SearchIcon,
  ScanBarcodeIcon,
  ImageIcon,
  SwitchCameraIcon,
  ScanSearchIcon,
} from '@lucide/vue'
import type { ScanFrame } from '@sageleaf/scanleaf'
import { isTauri } from '@tauri-apps/api/core'

import type { ScanVariant } from '~/components/search/ScanResultsDrawer.vue'
import { useStatusBarOverlay } from '~/composables/useStatusBarOverlay'

useTopbar(null)
useNavbar(false)
useStatusBarOverlay(false)

const isNative = isTauri()

// Scanner ref

const scanner = ref<{
  toggleFreeze: () => void
  flipCamera: () => void
  pickImage: () => void
} | null>(null)

// Search pipeline

const { addFrame, addBarcode, query, queryType, reset } = useScanSearch()

onUnmounted(() => reset())

// Apollo queries

const scanSearchQuery = gql`
  query ScanSearchQuery($query: String!) {
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

type ScanSearchResult = {
  search: { nodes: ScanVariant[]; totalCount: number }
}

// Barcode query — fires immediately when queryType === 'barcode'
const { result: barcodeResult, loading: barcodeLoading } = useQuery<ScanSearchResult>(
  scanSearchQuery,
  () => ({ query: query.value }),
  () => ({ enabled: !!query.value && queryType.value === 'barcode' }),
)

// Text query — fires when queryType === 'text' (already rate-limited by composable)
const { result: textResult, loading: textLoading } = useQuery<ScanSearchResult>(
  scanSearchQuery,
  () => ({ query: query.value }),
  () => ({ enabled: !!query.value && queryType.value === 'text' }),
)

const isSearching = computed(() => barcodeLoading.value || textLoading.value)

// Result accumulation

const exactMatches = ref<ScanVariant[]>([])
const possibleMatches = ref<ScanVariant[]>([])

function mergeVariants(target: Ref<ScanVariant[]>, incoming: ScanVariant[]) {
  for (const v of incoming) {
    if (!target.value.some((sv) => sv.id === v.id)) {
      target.value.push(v)
    }
  }
}

watch(barcodeResult, (res) => {
  const variants = (res?.search.nodes ?? []) as ScanVariant[]
  mergeVariants(exactMatches, variants)
  if (variants.length > 0 && drawerOpen.value === false) openDrawerToPeek()
})

watch(textResult, (res) => {
  const variants = (res?.search.nodes ?? []) as ScanVariant[]
  mergeVariants(possibleMatches, variants)
  if (variants.length > 0 && drawerOpen.value === false) openDrawerToPeek()
})

const totalResultCount = computed(() => exactMatches.value.length + possibleMatches.value.length)

// Drawer state

const SNAP_PEEK = 0.3
const drawerOpen = ref(false)
const drawerSnap = ref<number>(0)

function openDrawerToPeek() {
  drawerOpen.value = true
  drawerSnap.value = SNAP_PEEK
}

function toggleResultsDrawer() {
  if (drawerOpen.value) {
    drawerOpen.value = false
    drawerSnap.value = 0
  } else {
    openDrawerToPeek()
  }
}

// Frame handling

const onScanDetected = (code: string) => {
  // Used by the Quagga web scanner (native path handles barcodes through onScanFrame)
  if (code) addBarcode(code)
}

const onScanFrame = (frame: ScanFrame) => {
  addFrame(frame)
  if (isDev) {
    debugFrames.value.unshift(frame)
    if (debugFrames.value.length > MAX_DEBUG_FRAMES) {
      debugFrames.value.length = MAX_DEBUG_FRAMES
    }
  }
}

// Dev debug

const isDev = import.meta.env.DEV
const debugOpen = ref(false)
const debugFrames = ref<ScanFrame[]>([])
const MAX_DEBUG_FRAMES = 20
</script>

<style scoped>
/* Mask the interior so only the border ring (padding area) is visible */
.scan-border {
  padding: 3px;
  overflow: hidden;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Large spinning square with a full-spectrum rainbow conic gradient */
.scan-border-spin {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: max(200vw, 200vh);
  aspect-ratio: 1;
  background: conic-gradient(in oklch longer hue, oklch(0.85 0.37 0), oklch(0.85 0.37 0));
  animation: scan-border-rotate 3s linear infinite;
}

@keyframes scan-border-rotate {
  to {
    rotate: 1turn;
  }
}

/* Fade in/out transitions */
.rainbow-enter-active,
.rainbow-leave-active {
  transition: opacity 0.8s ease-out;
}
.rainbow-enter-from,
.rainbow-leave-to {
  opacity: 0;
}
</style>
