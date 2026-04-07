<template>
  <Collapsible v-model:open="open">
    <div class="flex items-center gap-1 py-0.5 pl-1">
      <CollapsibleTrigger as-child>
        <button
          class="flex size-6 shrink-0 items-center justify-center rounded hover:bg-base-300"
          :class="{ invisible: !hasChildren }"
          @click="onToggle"
        >
          <ChevronRight
            class="size-4 transition-transform duration-150"
            :class="{ 'rotate-90': open }"
          />
        </button>
      </CollapsibleTrigger>

      <NuxtLink :to="`/materials/${material.id}`" class="truncate text-sm hover:underline">
        {{ material.name ?? material.id }}
      </NuxtLink>
    </div>

    <CollapsibleContent>
      <div class="pl-6">
        <div v-if="loading || !loaded" class="flex items-center gap-2 py-1 pl-1 text-xs opacity-50">
          <span class="loading loading-xs loading-spinner" />
          Loading…
        </div>

        <template v-else-if="children.length">
          <MaterialTreeNode
            v-for="child in children"
            :key="child.id"
            :material="child"
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

const props = defineProps<{
  material: { id: string; name?: string | null }
  hasChildren?: boolean
}>()

const open = ref(false)
const loaded = ref(false)

type ChildNode = { id: string; name?: string | null; hasChildren: boolean }
const children = ref<ChildNode[]>([])

const childrenQuery = graphql(`
  query MaterialTreeNodeChildren($id: ID!) {
    material(id: $id) {
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

const { load, onResult, loading } = useLazyQuery(childrenQuery, { id: props.material.id })

onResult((result) => {
  loaded.value = true
  children.value =
    result.data?.material?.children?.nodes?.map((n) => ({
      id: n.id,
      name: n.name,
      hasChildren: (n.children?.totalCount ?? 0) > 0,
    })) ?? []
})

const onToggle = () => {
  if (!loaded.value) {
    load()
  }
}
</script>
