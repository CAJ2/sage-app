<template>
  <NuxtLinkLocale to="/changes" class="flex content-center">
    <div v-if="isChangeSelected" class="grow flex flex-col">
      <div class="text-md font-bold">
        {{ result?.change?.title || 'Loading...' }}
      </div>
      <div class="text-sm opacity-70 line-clamp-1">
        {{ result?.change?.description || '' }}
      </div>
    </div>
    <div v-else class="grow text-md opacity-70">No Change Selected</div>
    <Button
      v-if="selectedChange"
      variant="ghost"
      @click.stop.prevent="clearChange"
    >
      <font-awesome-icon icon="fa-solid fa-xmark" width="5" height="5" />
    </Button>
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const changeStore = useChangeStore()
const { selectedChange, isChangeSelected } = storeToRefs(changeStore)

const ChangeSelectorQuery = graphql(`
  query ChangeSelector($id: ID!) {
    change(id: $id) {
      id
      title
      description
    }
  }
`)
const { result, load, refetch } = useLazyQuery(ChangeSelectorQuery, {
  id: selectedChange.value,
})
watch(
  selectedChange,
  async (newId) => {
    if (newId) {
      await (load(ChangeSelectorQuery, { id: newId }) || refetch({ id: newId }))
    }
  },
  { immediate: true },
)

const clearChange = () => {
  changeStore.setChange('')
}
</script>
