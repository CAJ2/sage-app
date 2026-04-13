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
            <div v-if="entity.desc">
              <span class="font-semibold">Description:</span> {{ entity.desc }}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Primary Material</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="entity.primaryMaterial?.name" class="text-sm">
            {{ entity.primaryMaterial.name }}
          </div>
          <div v-else class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-1">
            <li v-for="cm in entity.materials ?? []" :key="cm.material.id" class="text-sm">
              {{ cm.material.name }}
              <span v-if="cm.materialFraction != null" class="opacity-70"
                >— {{ Math.round(cm.materialFraction * 100) }}%</span
              >
            </li>
          </ul>
          <div v-if="!entity.materials?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>

      <Card v-if="entity.recycleScore" class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Recycle Score</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-3 text-sm">
          <span class="text-2xl font-bold">{{ entity.recycleScore.score }}</span>
          <span class="badge badge-outline">{{ entity.recycleScore.rating }}</span>
          <span v-if="entity.recycleScore.name">{{ entity.recycleScore.name }}</span>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li
              v-for="cs in entity.sources?.nodes ?? []"
              :key="cs.source.id"
              class="flex items-center gap-2 text-sm"
            >
              <span class="badge badge-outline badge-sm">{{ cs.source.type }}</span>
              <a
                v-if="cs.source.contentURL"
                :href="cs.source.contentURL"
                target="_blank"
                class="max-w-xs link truncate link-primary"
                >{{ cs.source.contentURL }}</a
              >
              <NuxtLink :to="`/sources/${cs.source.id}`" class="link text-xs link-secondary"
                >View</NuxtLink
              >
            </li>
          </ul>
          <div v-if="!entity.sources?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="flex justify-center p-8">
      <span class="loading loading-lg loading-spinner" />
    </div>

    <Dialog v-model:open="showEdit">
      <DialogContent class="max-h-[80vh] overflow-auto sm:max-w-[70vw]">
        <DialogTitle>Edit Component</DialogTitle>
        <ModelForm
          :change-id="selectedChange"
          :model-id="id"
          :schema-query="componentSchema"
          :create-mutation="createComponentMutation"
          :update-mutation="updateComponentMutation"
          :create-model-key="'component'"
          @saved="showEdit = false"
        />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showDelete">
      <DialogContent>
        <DialogTitle>Delete Component</DialogTitle>
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
  query ComponentDetail($id: ID!) {
    component(id: $id) {
      id
      name
      desc
      imageURL
      createdAt
      updatedAt
      primaryMaterial {
        id
        name
      }
      materials {
        material {
          id
          name
        }
        materialFraction
      }
      recycleScore {
        score
        rating
        ratingF
        name
      }
      sources(first: 10) {
        nodes {
          source {
            id
            type
            contentURL
            location
          }
        }
      }
    }
  }
`)

const { result } = useQuery(detailQuery, { id })
const entity = computed(() => result.value?.component ?? null)

const componentSchema = graphql(`
  query ComponentDetailSchema {
    componentSchema {
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
  mutation CreateComponentFromDetail($input: CreateComponentInput!) {
    createComponent(input: $input) {
      component {
        id
        name
      }
    }
  }
`)

const updateComponentMutation = graphql(`
  mutation UpdateComponentFromDetail($input: UpdateComponentInput!) {
    updateComponent(input: $input) {
      component {
        id
        name
      }
    }
  }
`)

const deleteComponentMutation = graphql(`
  mutation DeleteComponentFromDetail($input: DeleteInput!) {
    deleteComponent(input: $input) {
      success
    }
  }
`)

const { mutate: deleteComponent } = useMutation(deleteComponentMutation)

const showEdit = ref(false)
const showDelete = ref(false)

const doDelete = async () => {
  await deleteComponent({ input: { id, changeID: selectedChange.value } })
  navigateTo('/components')
}
</script>
