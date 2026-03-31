<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button
        class="btn mx-3 w-48 justify-start bg-zinc-600/30 hover:bg-zinc-300/50"
        variant="ghost"
      >
        <SearchIcon :size="16" class="mr-1 opacity-60" />
        <span class="opacity-60">Search...</span>
        <kbd
          class="pointer-events-none ml-auto hidden items-center gap-1 rounded border border-base-content/20 bg-base-content/10 px-1.5 py-0.5 font-mono text-[10px] opacity-60 select-none sm:flex"
        >
          <span class="text-[10px]">⌘</span>K
        </kbd>
      </Button>
    </DialogTrigger>
    <DialogContent class="top-[20%] translate-y-0 overflow-hidden p-0 sm:max-w-[640px]">
      <div class="flex h-full w-full flex-col overflow-hidden rounded-xl bg-base-100">
        <!-- Search input row -->
        <div class="flex items-center border-b border-base-content/10 px-4">
          <SearchIcon :size="20" class="shrink-0 opacity-40" />
          <input
            ref="inputRef"
            v-model="searchInput"
            type="text"
            placeholder="Search categories, items, orgs, places…"
            class="flex h-14 w-full rounded-md border-0 bg-transparent py-3 pl-3 text-base text-base-content outline-none placeholder:opacity-35"
          />
          <button
            v-if="searchInput"
            class="shrink-0 rounded p-1.5 opacity-40 transition hover:opacity-80"
            @click="searchInput = ''"
          >
            <XIcon :size="16" />
          </button>
        </div>

        <!-- Results area -->
        <div class="max-h-[480px] overflow-x-hidden overflow-y-auto" role="listbox">
          <!-- Loading skeleton -->
          <div v-if="loading" class="flex flex-col gap-1 p-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4 rounded-lg px-3 py-3">
              <div class="size-11 shrink-0 skeleton rounded-lg" />
              <div class="flex flex-1 flex-col gap-2">
                <div class="h-3.5 w-28 skeleton rounded" />
                <div class="h-3 w-48 skeleton rounded" />
              </div>
            </div>
          </div>

          <!-- Results list -->
          <div v-else-if="results.length > 0" class="flex flex-col gap-0.5 p-3">
            <div
              v-if="totalCount"
              class="px-3 pt-0.5 pb-1.5 text-xs tracking-wide text-base-content/40"
            >
              About {{ totalCount }} result{{ totalCount !== 1 ? 's' : '' }}
            </div>
            <NuxtLink
              v-for="(item, index) in results"
              :key="item.id"
              :to="routeForItem(item.__typename, item.id)"
              class="group flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-base-200 focus:bg-base-200 focus:outline-none"
              :class="{ 'bg-base-200': focusedIndex === index }"
              role="option"
              @click="open = false"
              @mouseenter="focusedIndex = index"
            >
              <!-- Icon / Image -->
              <div
                class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-200"
              >
                <UiImage
                  v-if="item.imageURL || item.avatarURL"
                  :src="item.imageURL || item.avatarURL"
                  :width="11"
                  :height="11"
                  class="size-11"
                />
                <component
                  :is="placeholderIcon(item.__typename)"
                  v-else
                  :size="20"
                  class="opacity-35"
                />
              </div>

              <!-- Text content -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2.5">
                  <Badge :variant="badgeVariant(item.__typename)" class="shrink-0 text-[11px]">
                    {{ formatType(item.__typename) }}
                  </Badge>
                  <span class="truncate text-sm font-semibold text-base-content">
                    {{ item.name || item.name_null || item.name_req || item.name_place }}
                  </span>
                </div>
                <p
                  v-if="item.descShort || item.desc"
                  class="mt-1 truncate text-sm text-base-content/50"
                >
                  {{ item.descShort || item.desc }}
                </p>
              </div>

              <ChevronRightIcon
                :size="18"
                class="shrink-0 opacity-0 transition-opacity group-hover:opacity-30"
              />
            </NuxtLink>
          </div>

          <!-- No results -->
          <div
            v-else-if="debouncedSearch.length >= 2 && !loading"
            class="flex flex-col items-center justify-center gap-3 py-14 text-base-content/40"
          >
            <SearchXIcon :size="32" />
            <p class="text-sm">
              No results for <strong>"{{ debouncedSearch }}"</strong>
            </p>
          </div>

          <!-- Empty / prompt state -->
          <div
            v-else-if="!debouncedSearch"
            class="flex flex-col items-center justify-center gap-3 py-14 text-base-content/30"
          >
            <SearchIcon :size="32" />
            <p class="text-sm">Type to search</p>
          </div>
        </div>

        <!-- Footer hint -->
        <div
          v-if="results.length > 0"
          class="flex items-center gap-4 border-t border-base-content/10 px-5 py-2.5 text-xs text-base-content/30"
        >
          <span class="flex items-center gap-1.5">
            <kbd class="rounded border border-base-content/20 px-1.5 py-0.5 font-mono">↵</kbd> to
            open
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="rounded border border-base-content/20 px-1.5 py-0.5 font-mono">↑↓</kbd>
            navigate
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="rounded border border-base-content/20 px-1.5 py-0.5 font-mono">esc</kbd>
            close
          </span>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  BoxIcon,
  Building2Icon,
  ChevronRightIcon,
  CircleHelpIcon,
  CpuIcon,
  MapPinIcon,
  PackageIcon,
  SearchIcon,
  SearchXIcon,
  TagsIcon,
  XIcon,
} from '@lucide/vue'
import { useEventListener, watchDebounced } from '@vueuse/core'
import type { Component } from 'vue'

const open = ref(false)
const searchInput = ref('')
const debouncedSearch = ref('')
const focusedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

// Open with Cmd+K / Ctrl+K
useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
})

// Focus input when dialog opens
watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    inputRef.value?.focus()
    focusedIndex.value = 0
  } else {
    searchInput.value = ''
    debouncedSearch.value = ''
  }
})

// 300ms debounce
watchDebounced(
  searchInput,
  (val) => {
    debouncedSearch.value = val
    focusedIndex.value = 0
  },
  { debounce: 300 },
)

const searchQuery = gql`
  query ScienceSearch($query: String!) {
    search(query: $query, types: [CATEGORY, ITEM, VARIANT, COMPONENT, ORG, PLACE]) {
      nodes {
        __typename
        ... on Category {
          id
          name
          descShort
          imageURL
        }
        ... on Item {
          id
          name_null: name
          desc
          imageURL
        }
        ... on Variant {
          id
          name_null: name
          desc
          imageURL
        }
        ... on Component {
          id
          name_null: name
          desc
        }
        ... on Org {
          id
          name_req: name
          desc
          avatarURL
        }
        ... on Place {
          id
          name_place: name
          desc
        }
      }
      totalCount
    }
  }
`

type SearchNode = {
  id: string
  __typename: string
  name?: string
  name_null?: string
  name_req?: string
  name_place?: string
  descShort?: string
  desc?: string
  imageURL?: string
  avatarURL?: string
}

type SearchResult = {
  search: {
    nodes: SearchNode[]
    totalCount: number
  }
}

const { result, loading } = useQuery<SearchResult>(
  searchQuery,
  () => ({ query: debouncedSearch.value }),
  () => ({ enabled: debouncedSearch.value.length >= 2 }),
)

const results = computed(() => result.value?.search.nodes ?? [])
const totalCount = computed(() => result.value?.search.totalCount ?? 0)

// Keyboard navigation through results
useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (!open.value || results.value.length === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusedIndex.value = Math.min(focusedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[focusedIndex.value]
    if (item) {
      navigateTo(routeForItem(item.__typename, item.id))
      open.value = false
    }
  }
})

function routeForItem(type: string, id: string): string {
  switch (type) {
    case 'Category':
      return `/categories/${id}`
    case 'Item':
      return `/items/${id}`
    case 'Variant':
      return `/variants/${id}`
    case 'Component':
      return `/components/${id}`
    case 'Org':
      return `/orgs/${id}`
    case 'Place':
      return `/places/${id}`
    default:
      return '#'
  }
}

type BadgeVariant =
  | 'default'
  | 'outline'
  | 'destructive'
  | 'blue'
  | 'yellow'
  | 'teal'
  | 'secondary'
  | 'red'
  | 'ghost'
  | 'gray'
  | 'plain'
  | 'purple'
  | 'orange'

const badgeVariantMap: Record<string, BadgeVariant> = {
  Category: 'blue',
  Item: 'yellow',
  Variant: 'teal',
  Component: 'purple',
  Org: 'orange',
  Place: 'red',
}

function badgeVariant(type: string): BadgeVariant {
  return badgeVariantMap[type] ?? 'ghost'
}

const formatTypeMap: Record<string, string> = {
  Category: 'Category',
  Item: 'Item',
  Variant: 'Variant',
  Component: 'Component',
  Org: 'Org',
  Place: 'Place',
}

function formatType(type: string): string {
  return formatTypeMap[type] ?? type
}

const placeholderIconMap: Record<string, Component> = {
  Category: BoxIcon,
  Item: PackageIcon,
  Variant: TagsIcon,
  Component: CpuIcon,
  Org: Building2Icon,
  Place: MapPinIcon,
}

function placeholderIcon(type: string): Component {
  return placeholderIconMap[type] ?? CircleHelpIcon
}
</script>
