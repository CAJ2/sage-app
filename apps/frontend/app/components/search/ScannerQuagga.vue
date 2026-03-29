<script setup lang="ts">
import type {
  QuaggaJSCodeReader,
  QuaggaJSConfigObject,
  QuaggaJSResultCallbackFunction,
  QuaggaJSResultObject,
} from '@ericblade/quagga2'
import Quagga from '@ericblade/quagga2'
import { onMounted, onBeforeUnmount, watch } from 'vue'

const emit = defineEmits<{
  detected: [code: string]
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
const scanError = ref<string | null>(null)
const unmounted = ref(false)

const stopCamera = () => {
  try {
    Quagga.stop()
  } catch {
    // Quagga may throw if the camera is already stopped — ignore
  }
  // Quagga may use a different video element than the one in the template,
  // and Quagga.stop() may throw — so stop all video tracks in the document
  for (const video of document.querySelectorAll('video')) {
    if (video.srcObject instanceof MediaStream) {
      for (const track of video.srcObject.getTracks()) {
        track.stop()
      }
      video.srcObject = null
    }
  }
}

const detectedHandler = (result: QuaggaJSResultObject) => {
  const err = getMedianOfCodeErrors(result.codeResult?.decodedCodes ?? [])
  if (err >= 0.25) return
  const { valid, modifiedCode } = validateBarcode(result.codeResult?.code ?? '')
  if (!valid) return
  emit('detected', modifiedCode)
}

watch(
  () => props.onProcessed,
  (newValue, oldValue) => {
    if (oldValue) Quagga.offProcessed(oldValue as unknown as QuaggaJSResultCallbackFunction)
    if (newValue) Quagga.onProcessed(newValue as unknown as QuaggaJSResultCallbackFunction)
  },
)

onMounted(() => {
  const quaggaState: QuaggaJSConfigObject = {
    inputStream: {
      type: 'LiveStream',
      target: container.value ?? undefined,
      constraints: {
        facingMode: 'environment',
        width: { min: 640, ideal: 1280 },
        height: { min: 480, ideal: 720 },
      },
    },
    locator: { patchSize: 'medium', halfSample: true, willReadFrequently: true },
    decoder: { readers: props.readerTypes ?? ['ean_reader'] },
    locate: true,
  }

  Quagga.init(quaggaState, (err: object | null) => {
    if (err) {
      scanError.value = 'Failed to initialize the scanner.'
      return
    }
    if (unmounted.value) {
      stopCamera()
      return
    }
    Quagga.start()
  })
  Quagga.onDetected(detectedHandler)
  Quagga.onProcessed(props.onProcessed as unknown as QuaggaJSResultCallbackFunction)
})

onBeforeUnmount(() => {
  unmounted.value = true
  Quagga.offDetected(detectedHandler)
  if (props.onProcessed)
    Quagga.offProcessed(props.onProcessed as unknown as QuaggaJSResultCallbackFunction)
  stopCamera()
})
</script>

<template>
  <div
    id="interactive"
    ref="container"
    class="viewport scanner relative h-full w-full overflow-hidden"
  >
    <span v-if="scanError" class="absolute inset-0 flex items-center justify-center text-center">
      {{ scanError }}
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
