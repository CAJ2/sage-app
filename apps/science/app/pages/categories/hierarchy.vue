<template>
  <div>
    <div class="p-3">
      <h1 class="text-xl font-bold">Category Hierarchy</h1>
    </div>

    <div class="m-3 rounded-lg border-0 bg-base-100 shadow-md">
      <div v-if="loading" class="flex justify-center p-8">
        <span class="loading loading-lg loading-spinner" />
      </div>

      <div v-else-if="rootChildren.length" class="p-3">
        <CategoryTreeNode
          v-for="child in rootChildren"
          :key="child.id"
          :category="child"
          :has-children="child.hasChildren"
        />
      </div>

      <div v-else class="p-8 text-center text-sm opacity-60">No root categories found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const rootQuery = graphql(`
  query CategoryTreeRoot {
    categoryRoot {
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

const { result, loading } = useQuery(rootQuery)

type RootChild = { id: string; name?: string | null; hasChildren: boolean }
const rootChildren = computed<RootChild[]>(
  () =>
    result.value?.categoryRoot?.children?.nodes?.map((n) => ({
      id: n.id,
      name: n.name,
      hasChildren: (n.children?.totalCount ?? 0) > 0,
    })) ?? [],
)
</script>
