<template>
  <Collapsible v-model:open="open">
    <div class="flex items-center gap-1 py-0.5 pl-1">
      <CollapsibleTrigger as-child>
        <button
          class="flex size-6 shrink-0 items-center justify-center rounded hover:bg-base-300"
          :class="{ invisible: !hasChildren }"
        >
          <ChevronRight
            class="size-4 transition-transform duration-150"
            :class="{ 'rotate-90': open }"
          />
        </button>
      </CollapsibleTrigger>

      <NuxtLink :to="`/categories/${category.id}`" class="truncate text-sm hover:underline">
        {{ category.name ?? category.id }}
      </NuxtLink>
    </div>

    <CollapsibleContent>
      <div class="pl-6">
        <div v-if="loading" class="flex items-center gap-2 py-1 pl-1 text-xs opacity-50">
          <span class="loading loading-xs loading-spinner" />
          Loading…
        </div>

        <template v-else-if="children.length">
          <CategoryTreeNode
            v-for="child in children"
            :key="child.id"
            :category="child"
            :has-children="child.hasChildren"
          />
        </template>

        <div v-else-if="loaded" class="py-1 pl-1 text-xs opacity-40">No children</div>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'

import { graphql } from '~/gql'

defineOptions({
  name: 'CategoryTreeNode',
})

const props = defineProps<{
  category: { id: string; name?: string | null }
  hasChildren?: boolean
}>()

const open = ref(false)
const loaded = ref(false)

type ChildNode = { id: string; name?: string | null; hasChildren: boolean }
const children = ref<ChildNode[]>([])

const childrenQuery = graphql(`
  query CategoryTreeNodeChildren($id: ID!) {
    category(id: $id) {
      children(first: 200) {
        nodes {
          id
          name
          children(first: 1) {
            totalCount
          }
        }
      }
    }
  }
`)

const { load, onResult, loading } = useLazyQuery(childrenQuery, { id: props.category.id })

onResult((result) => {
  loaded.value = true
  children.value =
    result.data?.category?.children?.nodes?.map((n) => ({
      id: n.id,
      name: n.name,
      hasChildren: (n.children?.totalCount ?? 0) > 0,
    })) ?? []
})

watch(open, (isOpen) => {
  if (isOpen && !loaded.value) {
    load()
  }
})
</script>
