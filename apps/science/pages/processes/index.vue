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
        Add Process
      </Button>
    </div>
    <GridModel
      title="Processes"
      :query="processQuery"
      :query-name="'getProcesses'"
    >
      <template #default="{ node }">
        <ModelListProcess
          :process="node"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModel>
    <Dialog v-model:open="showEdit">
      <DialogContent class="sm:max-w-[70vw] max-h-[80vh] overflow-auto">
        <DialogTitle>
          <span v-if="editId === 'new'">Create Process</span>
          <span v-else>Edit Process</span>
        </DialogTitle>
        <ModelFormDirect
          :model-id="editId"
          :schema-query="processSchema"
          :create-mutation="createProcessMutation"
          :update-mutation="updateProcessMutation"
          :create-model-key="'process'"
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
    editId.value = id
    showEdit.value = true
  }
}

const processQuery = graphql(`
  query ProcessesQuery(
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    getProcesses(first: $first, last: $last, before: $before, after: $after) {
      nodes {
        ...ListProcessFragment
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

const processSchema = graphql(`
  query ProcessesSchema {
    getProcessSchema {
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
const createProcessMutation = graphql(`
  mutation MainCreateProcess($input: CreateProcessInput!) {
    createProcess(input: $input) {
      process {
        id
        name
      }
    }
  }
`)
const updateProcessMutation = graphql(`
  mutation UpdateProcess($input: UpdateProcessInput!) {
    updateProcess(input: $input) {
      process {
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
