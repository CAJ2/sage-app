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
        Add Variant
      </Button>
    </div>
    <GridModelChanges
      :query="variantsChangesQuery"
      :type="EditModelType.Variant"
    >
      <template #default="{ node }">
        <ModelListVariant
          :variant="node.changes"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModelChanges>
    <GridModel title="Variants" :query="variantsQuery" :query-name="'variants'">
      <template #default="{ node }">
        <ModelListVariant
          :variant="node"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModel>
    <Dialog v-model:open="showEdit">
      <DialogContent class="sm:max-w-[70vw] max-h-[80vh] overflow-auto">
        <DialogTitle>
          <span v-if="editId === 'new'">Create Variant</span>
          <span v-else>Edit Variant</span>
        </DialogTitle>
        <ModelForm
          :change-id="selectedChange"
          :model-id="editId"
          :schema-query="variantSchema"
          :create-mutation="createVariantMutation"
          :update-mutation="updateVariantMutation"
          :create-model-key="'variant'"
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

const variantsQuery = graphql(`
  query VariantsQuery(
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    variants(first: $first, last: $last, before: $before, after: $after) {
      nodes {
        ...ListVariantFragment
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

const variantsChangesQuery = graphql(`
  query VariantsChangesQuery(
    $change_id: ID!
    $type: EditModelType
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    change(id: $change_id) {
      edits(
        type: $type
        first: $first
        last: $last
        before: $before
        after: $after
      ) {
        nodes {
          changes {
            ...ListVariantFragment
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

const variantSchema = graphql(`
  query VariantsSchema {
    variantSchema {
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
const createVariantMutation = graphql(`
  mutation CreateVariant($input: CreateVariantInput!) {
    createVariant(input: $input) {
      variant {
        id
        name
      }
    }
  }
`)
const updateVariantMutation = graphql(`
  mutation UpdateVariant($input: UpdateVariantInput!) {
    updateVariant(input: $input) {
      variant {
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
