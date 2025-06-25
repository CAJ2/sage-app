<template>
  <div>
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
        Add Component
      </Button>
    </div>
    <GridModelChanges
      :query="componentChangesQuery"
      :type="EditModelType.Component"
    >
      <template #default="{ node }">
        <ModelListComponent
          :component="node.changes"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModelChanges>
    <GridModel
      title="Components"
      :query="componentQuery"
      :query-name="'getComponents'"
    >
      <template #default="{ node }">
        <ModelListComponent
          :component="node"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModel>
    <Dialog v-model:open="showEdit">
      <DialogContent class="sm:max-w-[70vw] max-h-[80vh] overflow-auto">
        <DialogTitle>
          <span v-if="editId === 'new'">Create Component</span>
          <span v-else>Edit Component</span>
        </DialogTitle>
        <ModelForm
          :change-id="selectedChange"
          :model-id="editId"
          :schema-query="componentSchema"
          :create-mutation="createComponentMutation"
          :update-mutation="updateComponentMutation"
          :create-model-key="'component'"
          @saved="onSaved"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'
import { EditModelType } from '~/gql/graphql'

const changeStore = useChangeStore()
const { selectedChange } = storeToRefs(changeStore)

const actionButton = (btn: string, id: string) => {
  if (btn === 'edit') {
    editId.value = id
    showEdit.value = true
  }
}

const componentQuery = graphql(`
  query ComponentsQuery(
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    getComponents(first: $first, last: $last, before: $before, after: $after) {
      nodes {
        ...ListComponentFragment
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

const componentChangesQuery = graphql(`
  query ComponentChangesQuery(
    $change_id: ID!
    $type: EditModelType
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    getChange(id: $change_id) {
      edits(
        type: $type
        first: $first
        last: $last
        before: $before
        after: $after
      ) {
        nodes {
          changes {
            ...ListComponentFragment
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`)

const componentSchema = graphql(`
  query ComponentsSchema {
    getComponentSchema {
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
const createComponentMutation = graphql(`
  mutation MainCreateComponent($input: CreateComponentInput!) {
    createComponent(input: $input) {
      component {
        id
        name
      }
    }
  }
`)
const updateComponentMutation = graphql(`
  mutation UpdateComponent($input: UpdateComponentInput!) {
    updateComponent(input: $input) {
      component {
        id
        name
      }
    }
  }
`)

const showEdit = ref(false)
const editId = ref<string>('new')
const onSaved = () => {
  showEdit.value = false
  editId.value = 'new'
}
</script>
