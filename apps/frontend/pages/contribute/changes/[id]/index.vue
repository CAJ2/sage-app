<template>
  <div>
    <NavTopbar
      :title="changeData?.getChange?.title || 'Change'"
      :subtitle="changeData?.getChange?.description"
      back="true"
    ></NavTopbar>
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <Card class="mb-4">
          <CardContent class="pt-4">
            <div v-if="changeData" class="flex items-center">
              <div class="badge badge-lg badge-primary">
                {{ changeData.getChange?.status }}
              </div>
              <div class="px-4">
                {{ changeData.getChange?.user.username }}
                <span class="opacity-70"
                  >created on
                  {{
                    new Date(
                      changeData.getChange?.created_at,
                    ).toLocaleDateString()
                  }}</span
                >
              </div>
            </div>
          </CardContent>
        </Card>
        <div class="mt-3">
          <h2 class="text-lg">Edits</h2>
          <ul v-if="changeData" class="divide-y-1">
            <li
              v-for="edit in changeData.getChange.edits"
              :key="edit.id"
              class="border-neutral-300"
            >
              <NuxtLinkLocale :to="getEditSubLink(edit)">
                <div class="p-4">
                  <div class="flex items-center">
                    <div class="badge badge-sm badge-secondary">
                      {{ edit.entity_name }}
                    </div>
                    <div class="flex-1 px-4">
                      <span class="">{{ edit.changes.name }}</span>
                    </div>
                    <div>
                      <font-awesome-icon
                        icon="fa-solid fa-chevron-right"
                        class="text-neutral-300"
                      ></font-awesome-icon>
                    </div>
                  </div>
                </div>
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const changeQuery = gql`
  query ChangeQuery($id: ID!) {
    getChange(id: $id) {
      id
      status
      title
      description
      created_at
      updated_at
      user {
        id
        username
      }
      edits {
        id
        entity_name
        original {
          ... on Variant {
            name
          }
          ... on Component {
            name
          }
        }
        changes {
          ... on Variant {
            name
          }
          ... on Component {
            name
          }
        }
      }
    }
  }
`
type ChangeResult = {
  getChange: {
    id: string
    status: string
    title: string
    description?: string
    created_at: string
    updated_at: string
    user: {
      id: string
      username: string
    }
    edits: Array<{
      id: string
      entity_name: string
      original: { name?: string }
      changes: { name?: string }
    }>
  }
}
const { data: changeData } = await useAsyncQuery<ChangeResult>(changeQuery, {
  id: route.params.id,
})
console.log(changeData.value?.getChange)

const entityToPage: Record<string, string> = {
  Variant: 'variants',
  Component: 'components',
  Place: 'places',
  Category: 'categories',
  Region: 'regions',
  Item: 'items',
}

const getEditSubLink = (edit: ChangeResult['getChange']['edits'][0]) => {
  return `/contribute/changes/${changeData.value?.getChange.id}/${entityToPage[edit.entity_name]}/${edit.id}`
}
</script>
