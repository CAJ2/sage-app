<template>
  <div>
    <div class="flex items-start gap-3 p-3">
      <Button variant="ghost" @click="router.back()">
        <ArrowLeft class="size-4" />
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
            <div v-if="entity.descShort">
              <span class="font-semibold">Short description:</span> {{ entity.descShort }}
            </div>
            <div v-if="entity.desc">
              <span class="font-semibold">Description:</span> {{ entity.desc }}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Parent Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list">
            <div v-for="parent in entity.parents?.nodes ?? []" :key="parent.id">
              <ModelListCategory :category="parent" :href="`/categories/${parent.id}`" />
            </div>
          </ul>
          <div v-if="!entity.parents?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Child Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list">
            <div v-for="child in entity.children?.nodes ?? []" :key="child.id">
              <ModelListCategory :category="child" :href="`/categories/${child.id}`" />
            </div>
          </ul>
          <div v-if="!entity.children?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list">
            <div v-for="item in entity.items?.nodes ?? []" :key="item.id">
              <ModelListItem :item="item" :href="`/items/${item.id}`" />
            </div>
          </ul>
          <div v-if="!entity.items?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="flex justify-center p-8">
      <span class="loading loading-lg loading-spinner" />
    </div>

    <Dialog v-model:open="showEdit">
      <DialogContent class="max-h-[80vh] overflow-auto sm:max-w-[70vw]">
        <DialogTitle>Edit Category</DialogTitle>
        <ModelForm
          :change-id="selectedChange"
          :model-id="id"
          :schema-query="categorySchema"
          :create-mutation="createCategoryMutation"
          :update-mutation="updateCategoryMutation"
          :create-model-key="'category'"
          @saved="showEdit = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showDelete">
      <DialogContent>
        <DialogTitle>Delete Category</DialogTitle>
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
const router = useRouter()
const id = route.params.id as string

const { requireAuth } = useRequireAuth()

const changeStore = useChangeStore()
const { selectedChange, isChangeSelected } = storeToRefs(changeStore)

const detailQuery = graphql(`
  query CategoryDetail($id: ID!) {
    category(id: $id) {
      id
      name
      desc
      descShort
      imageURL
      createdAt
      updatedAt
      parents(first: 10) {
        nodes {
          id
          ...ListCategoryFragment
        }
      }
      children(first: 20) {
        nodes {
          id
          ...ListCategoryFragment
        }
      }
      items(first: 20) {
        nodes {
          id
          ...ListItemFragment
        }
      }
    }
  }
`)

const { result } = useQuery(detailQuery, { id })
const entity = computed(() => result.value?.category ?? null)

const categorySchema = graphql(`
  query CategoryDetailSchema {
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
  mutation CreateCategoryFromDetail($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      category {
        id
        name
      }
    }
  }
`)

const updateCategoryMutation = graphql(`
  mutation UpdateCategoryFromDetail($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      category {
        id
        name
      }
    }
  }
`)

const deleteCategoryMutation = graphql(`
  mutation DeleteCategoryFromDetail($input: DeleteInput!) {
    deleteCategory(input: $input) {
      success
    }
  }
`)

const { mutate: deleteCategory } = useMutation(deleteCategoryMutation)

const showEdit = ref(false)
const showDelete = ref(false)

const doDelete = async () => {
  await deleteCategory({ input: { id, changeID: selectedChange.value } })
  navigateTo('/categories')
}
</script>
