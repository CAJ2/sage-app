<template>
  <div :data-ag-theme-mode="getThemeMode">
    <div class="p-3">
      <Button
        @click="
          () => {
            editId = 'new'
            showEdit = true
          }
        "
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Add Change
      </Button>
    </div>
    <ag-grid-vue
      :row-data="changes"
      :column-defs="colDefs"
      :default-col-def="{
        flex: 1,
        filter: true,
        sortable: true,
      }"
      style="height: 100vh"
    ></ag-grid-vue>
    <Dialog v-model:open="showEdit">
      <DialogContent class="sm:max-w-[70vw] max-h-[80vh] overflow-auto">
        <DialogTitle>
          <span v-if="editId === 'new'">Create Change</span>
          <span v-else>Edit Change</span>
        </DialogTitle>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { GridEditActions } from '#components'
import { AgGridVue } from 'ag-grid-vue3'
import { graphql } from '~/gql'
import type { Change } from '~/gql/graphql'

const updateAction = (data: Change) => {
  editId.value = data.id
  showEdit.value = true
}
const colDefs = ref([
  { field: 'id' },
  { field: 'title' },
  { field: 'description' },
  {
    colId: 'actions',
    cellRenderer: GridEditActions,
    cellRendererParams: { actions: { update: updateAction } },
  },
])

const changesQuery = graphql(`
  query ChangesQuery {
    getChanges(first: 10) {
      nodes {
        id
        title
        description
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`)
const { result: changesData, refetch: refetchChanges } = useQuery(changesQuery)
refetchChanges()
const changes = computed(() => changesData.value?.getChanges?.nodes || [])

const _createChangeMutation = graphql(`
  mutation CreateChange($input: CreateChangeInput!) {
    createChange(input: $input) {
      change {
        id
      }
    }
  }
`)
const _updateChangeMutation = graphql(`
  mutation UpdateChange($input: UpdateChangeInput!) {
    updateChange(input: $input) {
      change {
        id
      }
    }
  }
`)

const showEdit = ref(false)
const editId = ref<string>('new')
</script>
