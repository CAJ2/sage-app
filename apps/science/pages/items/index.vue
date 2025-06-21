<template>
  <div :data-ag-theme-mode="isDark ? 'dark' : 'light'">
    <div class="p-3">
      <Button
        @click="
          () => {
            editItemId = 'new'
            showEditItem = true
          }
        "
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Add Item
      </Button>
    </div>
    <ag-grid-vue
      :row-data="items"
      :column-defs="colDefs"
      :default-col-def="{
        flex: 1,
        filter: true,
        sortable: true,
      }"
      style="height: 100vh"
    ></ag-grid-vue>
    <Dialog v-model:open="showEditItem">
      <DialogContent class="sm:max-w-[70vw] max-h-[80vh] overflow-auto">
        <DialogTitle>
          <span v-if="editItemId === 'new'">Create Item</span>
          <span v-else>Edit Item</span>
        </DialogTitle>
        <ModelFormDirect
          :model-id="editItemId"
          :schema-query="itemSchema"
          :create-mutation="createItemMutation"
          :update-mutation="updateItemMutation"
          :create-model-key="'item'"
          @saved="onSaved"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { GridEditActions } from '#components'
import { useDark } from '@vueuse/core'
import { AgGridVue } from 'ag-grid-vue3'
import { graphql } from '~/gql'
import type { Item } from '~/gql/graphql'

const isDark = useDark()

const updateAction = (data: Item) => {
  editItemId.value = data.id
  showEditItem.value = true
}
const colDefs = ref([
  { field: 'id' },
  { field: 'name' },
  { field: 'desc' },
  {
    colId: 'actions',
    cellRenderer: GridEditActions,
    cellRendererParams: { actions: { update: updateAction } },
  },
])

const itemsQuery = graphql(`
  query ItemsQuery {
    getItems(first: 10) {
      nodes {
        id
        name
        desc
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`)
const { result: itemsData, refetch: refetchItems } = useQuery(itemsQuery)
refetchItems()
const items = computed(() => itemsData.value?.getItems?.nodes || [])

const itemSchema = graphql(`
  query ItemsSchema {
    getItemSchema {
      create {
        schema
        uischema
      }
      update {
        schema
        uischema
      }
    }
  }
`)
const createItemMutation = graphql(`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      item {
        id
        name
      }
    }
  }
`)
const updateItemMutation = graphql(`
  mutation UpdateItem($input: UpdateItemInput!) {
    updateItem(input: $input) {
      item {
        id
        name
      }
    }
  }
`)

const showEditItem = ref(false)
const editItemId = ref<string>('new')
const onSaved = () => {
  showEditItem.value = false
  editItemId.value = 'new'
  refetchItems()
}
</script>
