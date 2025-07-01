<template>
  <div v-if="selectedChange">
    <Card class="m-3 bg-base-100 border-0 shadow-md">
      <CardHeader class="pb-2">
        <CardTitle class="flex justify-between">
          <span>Current Edits</span>
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
            <div
              v-for="n in nodes"
              :key="n.changes.id"
              class="flex items-center"
            >
              <div class="flex-1">
                <slot :node="n" />
              </div>
              <button
                class="btn btn-square btn-ghost"
                @click="discardEdit(n.changes.id)"
              >
                <font-awesome-icon icon="fa-solid fa-trash-can" />
              </button>
            </div>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { graphql } from '~/gql'
import type { EditModelType } from '~/gql/graphql'

type CursorVars = {
  changeID: string
  type?: EditModelType
  first?: number
  last?: number
  before: string | null
  after: string | null
}
const { desc, query, type, pageSize } = defineProps<{
  desc?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: TypedDocumentNode<Record<string, any>, CursorVars>
  type: EditModelType
  pageSize?: number
}>()

const changeStore = useChangeStore()
const { selectedChange } = storeToRefs(changeStore)

const fetchCount = pageSize || 5
const { result, refetch } = useQuery(query, {
  changeID: selectedChange.value,
  type,
  first: fetchCount,
  last: undefined,
  after: null,
  before: null,
} as CursorVars)
const nodes = computed(() => result.value?.change?.edits.nodes || [])
const hasPreviousPage = computed(() => {
  return result.value?.change?.edits.pageInfo?.hasPreviousPage || false
})
const hasNextPage = computed(() => {
  return result.value?.change?.edits.pageInfo?.hasNextPage || false
})

const prevPage = async () => {
  await refetch({
    changeID: selectedChange.value,
    first: undefined,
    last: fetchCount,
    after: null,
    before: result.value?.change?.edits.pageInfo?.startCursor || null,
  })
}
const nextPage = async () => {
  await refetch({
    changeID: selectedChange.value,
    first: fetchCount,
    last: undefined,
    before: null,
    after: result.value?.change?.edits.pageInfo?.endCursor || null,
  })
}

const discardEditMutation = graphql(`
  mutation DiscardEditMutation($changeID: ID!, $editID: ID!) {
    discardEdit(changeID: $changeID, editID: $editID) {
      id
    }
  }
`)

const discardEdit = async (editId: string) => {
  const { mutate } = useMutation(discardEditMutation, {
    variables: {
      changeID: selectedChange.value,
      editID: editId,
    },
  })
  await mutate()
}
</script>
