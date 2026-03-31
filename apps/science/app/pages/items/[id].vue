<template>
  <div>
    <div class="flex items-start gap-3 p-3">
      <Button variant="ghost" @click="navigateTo('/items')">
        <ArrowLeft class="size-4" />
        Items
      </Button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">{{ entity?.name ?? id }}</h1>
        <EntityMeta
          v-if="entity"
          :id="entity.id"
          :created-at="entity.createdAt"
          :updated-at="entity.updatedAt"
        />
      </div>
      <Button :disabled="!isChangeSelected" @click="requireAuth(() => (showEdit = true))">
        <Pencil class="size-4" />
        Edit
      </Button>
      <Button
        variant="destructive"
        :disabled="!isChangeSelected"
        @click="requireAuth(() => (showDelete = true))"
      >
        <Trash2 class="size-4" />
        Delete
      </Button>
    </div>

    <div v-if="!isChangeSelected" role="alert" class="mx-3 mb-3 alert alert-warning">
      <span>Select a change from the sidebar to edit or delete.</span>
    </div>

    <div v-if="entity">
      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent class="flex gap-4">
          <UiImage v-if="entity.imageURL" class="size-24 rounded" :src="entity.imageURL" />
          <div class="flex flex-col gap-1">
            <div><span class="font-semibold">Name:</span> {{ entity.name }}</div>
            <div v-if="entity.desc">
              <span class="font-semibold">Description:</span> {{ entity.desc }}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list">
            <div v-for="cat in entity.categories?.nodes ?? []" :key="cat.id">
              <ModelListCategory :category="cat" :href="`/categories/${cat.id}`" />
            </div>
          </ul>
          <div v-if="!entity.categories?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list">
            <div v-for="variant in entity.variants?.nodes ?? []" :key="variant.id">
              <ModelListVariant :variant="variant" :href="`/variants/${variant.id}`" />
            </div>
          </ul>
          <div v-if="!entity.variants?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="flex justify-center p-8">
      <span class="loading loading-lg loading-spinner" />
    </div>

    <Dialog v-model:open="showEdit">
      <DialogContent class="max-h-[80vh] overflow-auto sm:max-w-[70vw]">
        <DialogTitle>Edit Item</DialogTitle>
        <ModelForm
          :change-id="selectedChange"
          :model-id="id"
          :schema-query="itemSchema"
          :create-mutation="createItemMutation"
          :update-mutation="updateItemMutation"
          :create-model-key="'item'"
          @saved="showEdit = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showDelete">
      <DialogContent>
        <DialogTitle>Delete Item</DialogTitle>
        <p>
          Are you sure you want to delete <strong>{{ entity?.name }}</strong
          >? This action requires a change.
        </p>
        <DialogFooter>
          <Button variant="outline" @click="showDelete = false">Cancel</Button>
          <Button variant="destructive" @click="doDelete">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Pencil, Trash2 } from '@lucide/vue'

import { graphql } from '~/gql'

const route = useRoute()
const id = route.params.id as string

const { requireAuth } = useRequireAuth()

const changeStore = useChangeStore()
const { selectedChange, isChangeSelected } = storeToRefs(changeStore)

const detailQuery = graphql(`
  query ItemDetail($id: ID!) {
    item(id: $id) {
      id
      name
      desc
      imageURL
      createdAt
      updatedAt
      categories(first: 10) {
        nodes {
          id
          ...ListCategoryFragment
        }
      }
      variants(first: 20) {
        nodes {
          id
          ...ListVariantFragment
        }
      }
    }
  }
`)

const { result } = useQuery(detailQuery, { id })
const entity = computed(() => result.value?.item ?? null)

const itemSchema = graphql(`
  query ItemDetailSchema {
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
  mutation CreateItemFromDetail($input: CreateItemInput!) {
    createItem(input: $input) {
      item {
        id
        name
      }
    }
  }
`)

const updateItemMutation = graphql(`
  mutation UpdateItemFromDetail($input: UpdateItemInput!) {
    updateItem(input: $input) {
      item {
        id
        name
      }
    }
  }
`)

const deleteItemMutation = graphql(`
  mutation DeleteItemFromDetail($input: DeleteInput!) {
    deleteItem(input: $input) {
      success
    }
  }
`)

const { mutate: deleteItem } = useMutation(deleteItemMutation)

const showEdit = ref(false)
const showDelete = ref(false)

const doDelete = async () => {
  await deleteItem({ input: { id, changeID: selectedChange.value } })
  navigateTo('/items')
}
</script>
