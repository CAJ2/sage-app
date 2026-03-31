<script setup lang="ts">
import { CalendarIcon, CheckIcon, ClockIcon, CopyIcon } from '@lucide/vue'
import { useClipboard, useTimeAgo } from '@vueuse/core'
import { TooltipProvider } from 'reka-ui'

const props = defineProps<{
  id: string
  createdAt: string
  updatedAt?: string
}>()

const { copy, copied } = useClipboard({ source: computed(() => props.id) })

const createdDate = computed(() => new Date(props.createdAt))
const updatedDate = computed(() => new Date(props.updatedAt ?? props.createdAt))

const createdAgo = useTimeAgo(createdDate)
const updatedAgo = useTimeAgo(updatedDate)

const createdFull = computed(() => createdDate.value.toLocaleString())
const updatedFull = computed(() => updatedDate.value.toLocaleString())

const sameDate = computed(() => props.updatedAt === props.createdAt || !props.updatedAt)
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <div class="mt-1 flex flex-wrap items-center gap-1.5">
      <!-- ID with copy -->
      <Badge
        variant="ghost"
        as="button"
        class="cursor-pointer font-mono"
        :title="copied ? 'Copied!' : 'Click to copy ID'"
        @click="copy(id)"
      >
        <span class="max-w-[180px] truncate sm:max-w-none">{{ id }}</span>
        <CheckIcon v-if="copied" :size="11" class="shrink-0 text-success" />
        <CopyIcon v-else :size="11" class="shrink-0 opacity-50" />
      </Badge>

      <!-- Created (and Updated if same) -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Badge variant="ghost" class="cursor-default">
            <CalendarIcon :size="11" class="shrink-0" />
            {{ sameDate ? 'Created/Updated' : 'Created' }} {{ createdAgo }}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{{ createdFull }}</TooltipContent>
      </Tooltip>

      <!-- Updated (only when different from created) -->
      <Tooltip v-if="!sameDate && updatedAt">
        <TooltipTrigger as-child>
          <Badge variant="ghost" class="cursor-default">
            <ClockIcon :size="11" class="shrink-0" />
            Updated {{ updatedAgo }}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{{ updatedFull }}</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>
