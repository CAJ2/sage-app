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
    <GridModel
      title="Variants"
      :query="variantsQuery"
      :query-name="'getVariants'"
    >
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
        <ModelFormDirect
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
    getVariants(first: $first, last: $last, before: $before, after: $after) {
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

const variantSchema = graphql(`
  query VariantsSchema {
    getVariantSchema {
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
