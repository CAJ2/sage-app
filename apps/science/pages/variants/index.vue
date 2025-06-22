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
        Add Variant
      </Button>
    </div>
    <ag-grid-vue
      :row-data="variants"
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
import { GridEditActions } from '#components'
import { AgGridVue } from 'ag-grid-vue3'
import { graphql } from '~/gql'
import type { Variant } from '~/gql/graphql'

const updateAction = (data: Variant) => {
  editId.value = data.id
  showEdit.value = true
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

const variantsQuery = graphql(`
  query VariantsQuery {
    getVariants(first: 10) {
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
const { result: variantsData, refetch: refetchVariants } =
  useQuery(variantsQuery)
refetchVariants()
const variants = computed(() => variantsData.value?.getVariants?.nodes || [])

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
  refetchVariants()
}
</script>
