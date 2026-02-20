<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import type {
  InputStreamType,
  QuaggaJSCodeReader,
  QuaggaJSConfigObject,
  QuaggaJSResultCallbackFunction,
  QuaggaJSResultObject,
} from '@ericblade/quagga2'
import Quagga from '@ericblade/quagga2'

const props = withDefaults(
  defineProps<{
    onDetected?: (result: QuaggaJSResultObject | null) => void
    onProcessed?: (data: QuaggaJSResultObject) => void
    type?: InputStreamType
    readerTypes?: QuaggaJSCodeReader[]
    constraints?: MediaTrackConstraintSet
    locate?: boolean
    numOfWorkers?: number
    frequency?: number
    facingMode?: string
  }>(),
  {
    onDetected: (_result: QuaggaJSResultObject | null) => {},
    onProcessed: (result: QuaggaJSResultObject | null) => {
      const drawingCtx = Quagga.canvas.ctx.overlay
      const drawingCanvas = Quagga.canvas.dom.overlay

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
    type: 'LiveStream',
    readerTypes: () => ['code_128_reader'],
    constraints: () => ({
      width: 640,
      height: 480,
      aspectRatio: {
        min: 0,
        max: 1,
      },
    }),
    locate: true,
    numOfWorkers: 4,
    frequency: 10,
    facingMode: 'environment',
  },
)

const quaggaState = reactive<QuaggaJSConfigObject>({
  inputStream: {
    type: props.type,
    constraints: props.constraints,
  },
  locator: {
    patchSize: 'medium',
    halfSample: true,
  },
  numOfWorkers: props.numOfWorkers,
  frequency: props.frequency,
  decoder: {
    readers: props.readerTypes,
  },
  locate: props.locate,
})
const quaggaError = ref<string | null>(null)

watch(
  () => props.onDetected,
  (newValue, oldValue) => {
    if (oldValue) Quagga.offDetected(oldValue)
    if (newValue) Quagga.onDetected(newValue)
  },
)

watch(
  () => props.onProcessed,
  (newValue, oldValue) => {
    if (oldValue) Quagga.offProcessed(oldValue as unknown as QuaggaJSResultCallbackFunction)
    if (newValue) Quagga.onProcessed(newValue as unknown as QuaggaJSResultCallbackFunction)
  },
)

onMounted(() => {
  Quagga.init(quaggaState, (err: object | null) => {
    if (err) {
      quaggaError.value = `Failed to initialize the scanner.`
      return
    }
    Quagga.start()
  })
  Quagga.onDetected(props.onDetected)
  Quagga.onProcessed(props.onProcessed as unknown as QuaggaJSResultCallbackFunction)
})

onBeforeUnmount(() => {
  if (props.onDetected) Quagga.offDetected(props.onDetected)
  if (props.onProcessed)
    Quagga.offProcessed(props.onProcessed as unknown as QuaggaJSResultCallbackFunction)
  Quagga.stop()
})
</script>

<template>
  <div id="interactive" class="viewport scanner flex flex-col">
    <span v-if="quaggaError" class="text-center">{{ quaggaError }}</span>
    <video />
    <canvas class="drawingBuffer" />
  </div>
</template>
