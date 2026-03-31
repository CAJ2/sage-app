<template>
  <div>
    <div class="p-3">
      <Button @click="requireAuth(() => (showAdd = true))">
        <Plus />
        Add Source
      </Button>
    </div>

    <GridModel title="Sources" :query="sourcesQuery" :query-name="'sources'">
      <template #default="{ node }">
        <li class="list-row relative cursor-pointer hover:bg-base-200">
          <NuxtLink :to="`/sources/${node.id}`" class="absolute inset-0" />
          <div class="flex items-center gap-2">
            <span class="badge badge-outline badge-sm">{{ node.type }}</span>
          </div>
          <div class="overflow-hidden">
            <div class="truncate text-sm">
              <span v-if="node.contentURL">{{ node.contentURL }}</span>
              <span v-else class="opacity-60">No URL</span>
            </div>
            <div v-if="node.location" class="text-xs opacity-70">{{ node.location }}</div>
          </div>
          <div></div>
        </li>
      </template>
    </GridModel>

    <Dialog v-model:open="showAdd">
      <DialogContent class="max-h-[80vh] overflow-auto">
        <DialogTitle>Add Source</DialogTitle>
        <SourceForm @saved="showAdd = false" />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@lucide/vue'

import { graphql } from '~/gql'

const { requireAuth } = useRequireAuth()

const sourcesQuery = graphql(`
  query SourcesQuery($first: Int, $last: Int, $before: String, $after: String) {
    sources(first: $first, last: $last, before: $before, after: $after) {
      nodes {
        id
        type
        contentURL
        location
        processedAt
        createdAt
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

const showAdd = ref(false)
</script>
