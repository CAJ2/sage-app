<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{
  detected: [code: string]
}>()

const scanError = ref<string | null>(null)
const scanning = ref(false)

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

onMounted(async () => {
  const { scan, cancel, checkPermissions, requestPermissions, Format } =
    await import('@tauri-apps/plugin-barcode-scanner')

  const permission = await checkPermissions()
  if (permission !== 'granted') {
    const requested = await requestPermissions()
    if (requested !== 'granted') {
      scanError.value = 'Camera permission denied.'
      return
    }
  }

  const formats = PRODUCT_FORMATS.map((f) => Format[f as keyof typeof Format]).filter(Boolean)

  scanning.value = true
  while (scanning.value) {
    try {
      const result = await scan({ windowed: true, formats })
      if (result?.content) {
        const { valid } = validateBarcode(result.content)
        if (valid) emit('detected', result.content)
      }
    } catch {
      // cancelled on unmount — exit loop
      break
    }
  }

  cancel()
})

onBeforeUnmount(async () => {
  scanning.value = false
  const { cancel } = await import('@tauri-apps/plugin-barcode-scanner')
  cancel()
})
</script>

<template>
  <!-- Camera feed shows through the transparent webview behind this overlay -->
  <div class="relative h-full w-full">
    <span v-if="scanError" class="absolute inset-0 flex items-center justify-center text-center">
      {{ scanError }}
    </span>
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="h-48 w-72 rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
      />
    </div>
  </div>
</template>
