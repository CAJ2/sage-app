<script setup lang="ts">
import { ChevronRightIcon, TagsIcon } from '@lucide/vue'

export type ScanVariant = {
  id: string
  name: string
  desc: string
  imageURL: string
}

defineProps<{
  exactMatches: ScanVariant[]
  possibleMatches: ScanVariant[]
}>()

// Snap points as fractions of viewport height: hidden, peek (~45%), expanded (~80%)
const snapPoints = [0, 0.45, 0.8]
const activeSnap = defineModel<number>('activeSnap', { default: 0 })
const isOpen = defineModel<boolean>('open', { default: false })
</script>

<template>
  <Drawer
    v-model:open="isOpen"
    v-model:active-snap-point="activeSnap"
    :snap-points="snapPoints"
    :modal="false"
    :should-scale-background="false"
  >
    <DrawerContent class="pointer-events-auto flex max-h-[85vh] flex-col">
      <DrawerHeader>
        <DrawerTitle>Results</DrawerTitle>
      </DrawerHeader>
      <div class="flex-1 overflow-y-auto px-4 pb-8">
        <!-- Exact match section -->
        <template v-if="exactMatches.length">
          <p class="mt-2 mb-1 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
            Exact Match
          </p>
          <NuxtLink
            v-for="v in exactMatches"
            :key="v.id"
            :to="`/explore/variants/${v.id}`"
            class="flex items-center gap-3 rounded-lg py-2 active:bg-base-200"
          >
            <img
              v-if="v.imageURL"
              :src="v.imageURL"
              class="size-12 shrink-0 rounded-md object-cover"
            />
            <span
              v-else
              class="flex size-12 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-200"
            >
              <TagsIcon :size="18" class="opacity-30" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold">{{ v.name }}</p>
              <p class="truncate text-xs opacity-60">{{ v.desc }}</p>
            </div>
            <ChevronRightIcon :size="16" class="shrink-0 opacity-40" />
          </NuxtLink>
        </template>

        <!-- Possible matches section -->
        <template v-if="possibleMatches.length">
          <p class="mt-4 mb-1 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
            Possible Matches
          </p>
          <NuxtLink
            v-for="v in possibleMatches"
            :key="v.id"
            :to="`/explore/variants/${v.id}`"
            class="flex items-center gap-3 rounded-lg py-2 active:bg-base-200"
          >
            <img
              v-if="v.imageURL"
              :src="v.imageURL"
              class="size-12 shrink-0 rounded-md object-cover"
            />
            <span
              v-else
              class="flex size-12 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-200"
            >
              <TagsIcon :size="18" class="opacity-30" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold">{{ v.name }}</p>
              <p class="truncate text-xs opacity-60">{{ v.desc }}</p>
            </div>
            <ChevronRightIcon :size="16" class="shrink-0 opacity-40" />
          </NuxtLink>
        </template>

        <!-- Empty state -->
        <div
          v-if="!exactMatches.length && !possibleMatches.length"
          class="py-8 text-center text-sm text-base-content/40"
        >
          Nothing found yet — keep scanning.
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
