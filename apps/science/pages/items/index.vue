<template>
  <div>
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
    <GridModel title="Items" :query="itemsQuery" :query-name="'items'">
      <template #default="{ node }">
        <ModelListItem
          :item="node"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModel>
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
import { graphql } from '~/gql'

const actionButton = (btn: string, id: string) => {
  if (btn === 'edit') {
    editItemId.value = id
    showEditItem.value = true
  }
}

const itemsQuery = graphql(`
  query ItemsQuery($first: Int, $last: Int, $before: String, $after: String) {
    items(first: $first, last: $last, before: $before, after: $after) {
      nodes {
        ...ListItemFragment
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`)

const itemSchema = graphql(`
  query ItemsSchema {
    itemSchema {
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
}
</script>
