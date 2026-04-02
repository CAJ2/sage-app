<script setup lang="ts">
import { ImageIcon, SwitchCameraIcon, CircleIcon, PlayIcon } from '@lucide/vue'
import type { ScanFrame } from '@sageleaf/scanleaf'
import type { UnlistenFn } from '@tauri-apps/api/event'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const emit = defineEmits<{
  detected: [code: string]
  frame: [frame: ScanFrame]
}>()

const PRODUCT_FORMATS = [
  'EAN_13',
  'EAN_8',
  'UPC_A',
  'UPC_E',
  'CODE_128',
  'CODE_39',
  'ITF',
  'CODABAR',
  'DATA_MATRIX',
  'PDF_417',
] as const

const scanError = ref<string | null>(null)
const frozen = ref(false)
const facing = ref<'back' | 'front'>('back')
const imageInput = ref<HTMLInputElement | null>(null)

let unlisten: UnlistenFn | null = null
let api: typeof import('@sageleaf/scanleaf') | null = null

const startDetection = async () => {
  await api!.startScan({ barcodeFormats: [...PRODUCT_FORMATS] })
  frozen.value = false
}

onMounted(async () => {
  document.documentElement.style.background = 'transparent'
  document.body.style.background = 'transparent'

  api = await import('@sageleaf/scanleaf')
  const { checkPermissions, requestPermissions, openCamera, onDetection } = api

  const { camera } = await checkPermissions()
  if (camera !== 'granted') {
    const { camera: requested } = await requestPermissions()
    if (requested !== 'granted') {
      scanError.value = 'Camera permission denied.'
      return
    }
  }

  await openCamera({ windowed: true, facing: facing.value })

  unlisten = await onDetection((frame) => {
    emit('frame', frame)
    for (const barcode of frame.barcodes) {
      const { valid } = validateBarcode(barcode.rawValue)
      if (valid) emit('detected', barcode.rawValue)
    }
  })

  await startDetection()
})

onBeforeUnmount(async () => {
  document.documentElement.style.removeProperty('background')
  document.body.style.removeProperty('background')
  unlisten?.()
  await api?.stopScan()
  await api?.closeCamera()
})

const toggleFreeze = async () => {
  if (!api) return
  if (frozen.value) {
    await startDetection()
  } else {
    await api.stopScan()
    frozen.value = true
  }
}

const flipCamera = async () => {
  if (!api) return
  const next: 'back' | 'front' = facing.value === 'back' ? 'front' : 'back'
  await api.stopScan()
  await api.closeCamera()
  facing.value = next
  await api.openCamera({ windowed: true, facing: next })
  if (!frozen.value) {
    await startDetection()
  }
}

const pickImage = () => {
  imageInput.value?.click()
}

const onImagePicked = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const url = URL.createObjectURL(file)
  const { default: Quagga } = await import('@ericblade/quagga2')

  Quagga.decodeSingle(
    {
      src: url,
      numOfWorkers: 0,
      locate: true,
      decoder: {
        readers: [
          'ean_reader',
          'ean_8_reader',
          'upc_reader',
          'upc_e_reader',
          'code_128_reader',
          'code_39_reader',
          'i2of5_reader',
          'codabar_reader',
        ],
      },
    },
    (result) => {
      URL.revokeObjectURL(url)
      if (imageInput.value) imageInput.value.value = ''
      if (!result?.codeResult?.code) return
      const { valid, modifiedCode } = validateBarcode(result.codeResult.code)
      if (valid) emit('detected', modifiedCode)
    },
  )
}
</script>

<template>
  <!-- Camera feed shows through the transparent webview behind this overlay -->
  <div class="relative h-full w-full">
    <span v-if="scanError" class="absolute inset-0 flex items-center justify-center text-center">
      {{ scanError }}
    </span>

    <!-- Frozen indicator -->
    <div
      v-if="frozen"
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        class="rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
      >
        Paused
      </div>
    </div>

    <!-- Camera controls -->
    <div class="absolute inset-x-0 bottom-10 flex items-center justify-center gap-10">
      <!-- Gallery / image picker -->
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95"
        @click="pickImage"
      >
        <ImageIcon :size="22" />
      </button>

      <!-- Capture / resume button -->
      <button
        class="flex h-18 w-18 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white/40 active:scale-95"
        @click="toggleFreeze"
      >
        <PlayIcon v-if="frozen" :size="28" class="translate-x-0.5 text-black" />
        <CircleIcon v-else :size="36" class="text-black" fill="black" />
      </button>

      <!-- Flip camera -->
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95"
        @click="flipCamera"
      >
        <SwitchCameraIcon :size="22" />
      </button>
    </div>

    <!-- Hidden file input -->
    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="onImagePicked" />
  </div>
</template>
