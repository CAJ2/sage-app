<template>
  <NuxtLink to="/changes" class="flex min-h-16 content-center items-center">
    <div v-if="isChangeSelected" class="flex min-w-0 grow flex-col">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="text-md line-clamp-2 font-bold">
              {{ result?.change?.title || 'Loading...' }}
            </div>
          </TooltipTrigger>
          <TooltipContent>{{ result?.change?.title }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
