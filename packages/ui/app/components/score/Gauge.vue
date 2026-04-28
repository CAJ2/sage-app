<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score?: number | null
  rating?: string | null
  ratingF?: string | null
  minScore?: number | null
  maxScore?: number | null
  averageScore?: number | null
}>()

const safeScore = computed(() => props.score ?? 0)

const strokeColor = computed(() => {
  switch (props.rating) {
    case 'A_PLUS':
    case 'A':
      return 'text-green-500 dark:text-green-400'
    case 'B':
      return 'text-lime-500 dark:text-lime-400'
    case 'C':
      return 'text-yellow-400 dark:text-yellow-300'
    case 'D':
      return 'text-amber-500 dark:text-amber-400'
    case 'E':
      return 'text-orange-500 dark:text-orange-400'
    case 'F':
    case 'G':
      return 'text-red-500 dark:text-red-400'
    default:
      return 'text-gray-400 dark:text-gray-500'
  }
})

const avgCx = computed(() => {
  if (props.averageScore === null || props.averageScore === undefined) return null
  const angle = (135 + (props.averageScore / 100) * 270) * (Math.PI / 180)
  return 18 + 15.9155 * Math.cos(angle)
})

const avgCy = computed(() => {
  if (props.averageScore === null || props.averageScore === undefined) return null
  const angle = (135 + (props.averageScore / 100) * 270) * (Math.PI / 180)
  return 18 + 15.9155 * Math.sin(angle)
})
</script>

<template>
  <div class="relative">
    <svg class="size-full rotate-135" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Circle (Gauge) -->
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        class="stroke-current text-base-content/10"
        stroke-width="3"
        stroke-dasharray="75 100"
        stroke-linecap="round"
      ></circle>

      <!-- Min/Max Arc -->
      <circle
        v-if="minScore != null && maxScore != null"
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        :class="['stroke-current opacity-30', strokeColor]"
        stroke-width="3"
        :stroke-dasharray="`0 ${minScore * 0.75} ${(maxScore - minScore) * 0.75} 100`"
        stroke-linecap="round"
      ></circle>

      <!-- Main Gauge Progress -->
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        :class="['stroke-current', strokeColor]"
        stroke-width="3"
        :stroke-dasharray="`${safeScore * 0.75} 100`"
        stroke-linecap="round"
      ></circle>

      <!-- Average Circle (small hollow circle on track) -->
      <g v-if="avgCx != null && avgCy != null">
        <!-- Inner background fill -->
        <circle :cx="avgCx" :cy="avgCy" r="1.5" fill="currentColor" class="text-base-100" />
        <!-- Outer border -->
        <circle
          :cx="avgCx"
          :cy="avgCy"
          r="1.5"
          fill="none"
          :class="['stroke-current', strokeColor]"
          stroke-width="0.8"
        />
      </g>

      <!-- Value Text (centered inside SVG to scale with it) -->
      <g class="origin-center rotate-[-135deg]">
        <text
          x="18"
          y="18"
          text-anchor="middle"
          dominant-baseline="central"
          :class="['fill-current font-bold', strokeColor]"
          style="font-size: 11px"
        >
          {{ props.score ? safeScore : '?' }}
        </text>
        <text
          v-if="ratingF"
          x="18"
          y="26"
          text-anchor="middle"
          dominant-baseline="central"
          :class="['fill-current font-normal tracking-wider uppercase', strokeColor]"
          style="font-size: 5px"
        >
          {{ ratingF }}
        </text>
        <text
          v-else
          x="18"
          y="26"
          text-anchor="middle"
          dominant-baseline="central"
          class="fill-current font-normal opacity-60"
          style="font-size: 3px"
        ></text>
      </g>
    </svg>
  </div>
</template>
