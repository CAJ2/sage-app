<template>
  <div>
    <Card class="m-3 bg-base-100 border-0 shadow-md">
      <CardHeader>
        <CardTitle class="flex justify-between">
          <span>{{ title }}</span>
          <div class="flex justify-end gap-3">
            <Button
              :disabled="!hasPreviousPage"
              variant="outline"
              @click="prevPage"
            >
              <font-awesome-icon icon="fa-solid fa-caret-left" />
              Prev
            </Button>
            <Button
              :disabled="!hasNextPage"
              variant="outline"
              @click="nextPage"
            >
              Next
              <font-awesome-icon icon="fa-solid fa-caret-right" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>{{ desc }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <ul class="list">
            <div v-for="n in nodes" :key="n.id">
              <slot :node="n" />
            </div>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'

const { title, desc, query, queryName, pageSize } = defineProps<{
  title?: string
  desc?: string
  query: TypedDocumentNode
  queryName: string
  pageSize?: number
}>()

const fetchCount = pageSize || 20
type CursorVars = {
  first?: number
  last?: number
  before: string | null
  after: string | null
}
const { result, refetch } = useQuery(query, {
  first: fetchCount,
  last: undefined,
  after: null,
  before: null,
} as CursorVars)
const nodes = computed(() => result.value?.[queryName]?.nodes || [])
const hasPreviousPage = computed(() => {
  return result.value?.[queryName]?.pageInfo?.hasPreviousPage || false
})
const hasNextPage = computed(() => {
  return result.value?.[queryName]?.pageInfo?.hasNextPage || false
})

const prevPage = async () => {
  await refetch({
    first: undefined,
    last: fetchCount,
    after: null,
    before: result.value?.[queryName]?.pageInfo?.startCursor || null,
  })
}
const nextPage = async () => {
  await refetch({
    first: fetchCount,
    last: undefined,
    before: null,
    after: result.value?.[queryName]?.pageInfo?.endCursor || null,
  })
}
</script>
