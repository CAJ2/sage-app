<template>
  <div>
    <NavTopbar
      title="Changes"
      subtitle="View and manage your contributions."
      back="true"
    ></NavTopbar>
    <ModelChangeList
      v-if="result"
      :data="result.changes"
      :total-edits="
        result.changes.nodes
          ? result.changes.nodes[0]?.edits?.totalCount
          : undefined
      "
    />
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const changeListQuery = graphql(`
  query ChangesIndexGetChanges($first: Int) {
    changes(first: $first) {
      nodes {
        id
        status
        title
        description
        created_at
        updated_at
        edits {
          totalCount
        }
      }
    }
  }
`)
const { result } = useQuery(changeListQuery)
</script>
