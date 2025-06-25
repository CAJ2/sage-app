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
        Add Category
      </Button>
    </div>
    <GridModelChanges
      :query="categoriesChangesQuery"
      :type="EditModelType.Category"
    >
      <template #default="{ node }">
        <ModelListCategory
          :category="node.changes"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModelChanges>
    <GridModel
      title="Categories"
      :query="categoriesQuery"
      :query-name="'categories'"
    >
      <template #default="{ node }">
        <ModelListCategory
          :category="node"
          :buttons="['edit']"
          @button="actionButton"
        />
      </template>
    </GridModel>
    <Dialog v-model:open="showEdit">
      <DialogContent class="sm:max-w-[70vw] max-h-[80vh] overflow-auto">
        <DialogTitle>
          <span v-if="editId === 'new'">Create Category</span>
          <span v-else>Edit Category</span>
        </DialogTitle>
        <ModelForm
          :change-id="selectedChange"
          :model-id="editId"
          :schema-query="categorySchema"
          :create-mutation="createCategoryMutation"
          :update-mutation="updateCategoryMutation"
          :create-model-key="'category'"
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

const categoriesQuery = graphql(`
  query GridCategoriesQuery(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    categories(first: $first, last: $last, after: $after, before: $before) {
      nodes {
        ...ListCategoryFragment
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`)

const categoriesChangesQuery = graphql(`
  query CategoryChangesQuery(
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
            ...ListCategoryFragment
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

const categorySchema = graphql(`
  query CategoriesSchema {
    categorySchema {
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
const createCategoryMutation = graphql(`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      category {
        id
        name
      }
    }
  }
`)
const updateCategoryMutation = graphql(`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      category {
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
