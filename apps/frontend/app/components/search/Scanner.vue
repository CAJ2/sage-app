<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import type {
  QuaggaJSCodeReader,
  QuaggaJSConfigObject,
  QuaggaJSResultCallbackFunction,
  QuaggaJSResultObject,
} from '@ericblade/quagga2'
import Quagga from '@ericblade/quagga2'

const emit = defineEmits<{
  detected: [result: QuaggaJSResultObject | null]
}>()

const props = withDefaults(
  defineProps<{
    onProcessed?: (data: QuaggaJSResultObject) => void
    readerTypes?: QuaggaJSCodeReader[]
  }>(),
  {
    onProcessed: (result: QuaggaJSResultObject | null) => {
      const drawingCtx = Quagga.canvas.ctx.overlay
      const drawingCanvas = Quagga.canvas.dom.overlay

      if (!drawingCtx) return
      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas?.getAttribute('width') || '0', 10),
            parseInt(drawingCanvas?.getAttribute('height') || '0', 10),
          )
          result.boxes
            .filter((box) => box !== result.box)
            .forEach((box) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: 'green',
                lineWidth: 2,
              })
            })
        }
        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: '#00F',
            lineWidth: 2,
          })
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, {
            color: 'red',
            lineWidth: 3,
          })
        }
      }
    },
    readerTypes: () => ['ean_reader'],
  },
)

const container = ref<HTMLElement | null>(null)
const quaggaError = ref<string | null>(null)

watch(
  () => props.onProcessed,
  (newValue, oldValue) => {
    if (oldValue) Quagga.offProcessed(oldValue as unknown as QuaggaJSResultCallbackFunction)
    if (newValue) Quagga.onProcessed(newValue as unknown as QuaggaJSResultCallbackFunction)
  },
)

const detectedHandler = (result: QuaggaJSResultObject) => {
  const err = getMedianOfCodeErrors(result.codeResult?.decodedCodes ?? [])
  if (err >= 0.25) return
  const { valid } = validateBarcode(result.codeResult?.code ?? '')
  if (!valid) return
  emit('detected', result)
}

onMounted(async () => {
  const { offsetHeight: h } = container.value ?? { offsetHeight: 480 }

  // probe native camera resolution to compute the correct width for the given height
  let width = Math.round(h * (4 / 3))
  try {
    const probe = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    const { width: nativeW = 1, height: nativeH = 1 } = probe.getVideoTracks()[0]!.getSettings()
    width = Math.round(h * (nativeW / nativeH))
    probe.getTracks().forEach((t) => t.stop())
  } catch {
    // permission denied or no camera — fall back to 4:3
  }

  const quaggaState: QuaggaJSConfigObject = {
    inputStream: {
      type: 'LiveStream',
      target: container.value ?? undefined,
      constraints: { width, height: h },
    },
    locator: { patchSize: 'medium', halfSample: true, willReadFrequently: true },
    decoder: { readers: props.readerTypes ?? ['ean_reader'] },
    locate: true,
  }
  Quagga.init(quaggaState, (err: object | null) => {
    if (err) {
      quaggaError.value = `Failed to initialize the scanner.`
      return
    }
    Quagga.start()
  })
  Quagga.onDetected(detectedHandler)
  Quagga.onProcessed(props.onProcessed as unknown as QuaggaJSResultCallbackFunction)
})

onBeforeUnmount(() => {
  Quagga.offDetected(detectedHandler)
  if (props.onProcessed)
    Quagga.offProcessed(props.onProcessed as unknown as QuaggaJSResultCallbackFunction)
  Quagga.stop()
})
</script>

<template>
  <div
    id="interactive"
    ref="container"
    class="viewport scanner relative h-full w-full overflow-hidden"
  >
    <span v-if="quaggaError" class="absolute inset-0 flex items-center justify-center text-center">
      {{ quaggaError }}
    </span>
    <video />
    <canvas class="drawingBuffer" />
  </div>
</template>

<style scoped>
video,
canvas.drawingBuffer {
  position: absolute;
  top: 0;
  left: 50%;
  height: 100% !important;
  width: auto !important;
  transform: translateX(-50%);
}
</style>
