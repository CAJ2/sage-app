<template>
  <div>
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li v-if="status === 'pending'" class="list-row">
        <div class="skeleton h-4 w-28"></div>
        <div class="skeleton h-4 w-full"></div>
        <div class="skeleton h-4 w-full"></div>
      </li>

      <div v-if="data">
        <li v-for="change in data.nodes" :key="change.id">
          <NuxtLinkLocale
            :to="`/contribute/changes/${change.id}`"
            class="list-row"
          >
            <div class="flex flex-col gap-1">
              <span class="text-xs opacity-70">{{
                new Date(change.updatedAt).toLocaleDateString() +
                ' - ' +
                (change.edits ? change.edits.totalCount + ' edits' : 'No edits')
              }}</span>
              <div>
                <div class="text-bold">{{ change.title || 'Untitled' }}</div>
                <div class="text-xs opacity-70">
                  {{ change.description || 'No description provided' }}
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end">
              <span
                class="badge"
                :class="{
                  'badge-primary': change.status === ChangeStatus.Merged,
                  'badge-error': change.status === ChangeStatus.Rejected,
                  'badge-warning': change.status === ChangeStatus.Draft,
                  'badge-info': change.status === ChangeStatus.Proposed,
                }"
                >{{ change.status }}</span
              >
            </div>
          </NuxtLinkLocale>
        </li>
      </div>

      <li v-if="data && data.nodes?.length === 0" class="list-row">
        There are no changes to show
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ChangeStatus } from '~/gql/types.generated'
import type { Change } from '~/gql/types.generated'
const { data } = defineProps<{
  status?: string
  data?: {
    nodes?:
      | (Pick<
          Change,
          'id' | 'status' | 'title' | 'description' | 'updatedAt'
        > & {
          edits?: {
            totalCount: number
          }
        })[]
      | null
  }
}>()
</script>
