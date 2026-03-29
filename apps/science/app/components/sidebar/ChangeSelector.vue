<template>
  <NuxtLink to="/changes" class="flex content-center">
    <div v-if="isChangeSelected" class="flex grow flex-col">
      <div class="text-md font-bold">
        {{ result?.change?.title || 'Loading...' }}
      </div>
      <div class="line-clamp-1 text-sm opacity-70">
        {{ result?.change?.description || '' }}
      </div>
    </div>
    <div v-else class="text-md grow opacity-70">No Change Selected</div>
    <Button v-if="selectedChange" variant="ghost" @click.stop.prevent="clearChange">
      <X :size="20" />
    </Button>
  </NuxtLink>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'

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
  id: selectedChange.value || '',
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
  changeStore.setChange(undefined)
}
</script>
