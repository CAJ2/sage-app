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
        Add Change
      </Button>
    </div>
    <Card class="m-3 bg-base-100 border-0 shadow-md">
      <CardHeader>
        <CardTitle>Changes</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ul v-if="changes" class="list">
          <div v-for="(change, i) in changes" :key="i" class="list-item">
            <ModelListChange
              :change="change"
              :buttons="['select', 'edit']"
              @button="selectChange"
            />
          </div>
        </ul>
      </CardContent>
    </Card>
    <Dialog v-model:open="showEdit">
      <DialogContent class="max-h-[80vh] overflow-auto">
        <DialogTitle>
          <span v-if="editId === 'new'">Create Change</span>
          <span v-else>Edit Change</span>
        </DialogTitle>
        <FormChangeNew />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const { setChange } = useChangeStore()

const selectChange = (btn: string, id: string) => {
  if (btn === 'select') {
    setChange(id)
    return
  } else if (btn === 'edit') {
    editId.value = id
    showEdit.value = true
  }
}

const changesQuery = graphql(`
  query ChangesQuery($first: Int, $last: Int, $before: String, $after: String) {
    getChanges(first: $first, last: $last, before: $before, after: $after) {
      nodes {
        ...ListChangeFragment
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
const { result: changesData } = useQuery(changesQuery)
const changes = computed(() => changesData.value?.getChanges?.nodes || [])

const _createChangeMutation = graphql(`
  mutation CreateChange($input: CreateChangeInput!) {
    createChange(input: $input) {
      change {
        id
      }
    }
  }
`)
const _updateChangeMutation = graphql(`
  mutation UpdateChange($input: UpdateChangeInput!) {
    updateChange(input: $input) {
      change {
        id
      }
    }
  }
`)

const showEdit = ref(false)
const editId = ref<string>('new')
</script>
