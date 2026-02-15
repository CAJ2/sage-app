<template>
  <div>
    <NavTopbar
      :title="changeData?.change?.title || 'Change'"
      :subtitle="changeData?.change?.description || undefined"
      back="true"
    />
    <div class="flex justify-center">
      <div class="w-full max-w-2xl p-5">
        <Card class="mb-4">
          <CardContent v-if="changeData" class="p-4">
            <div class="flex items-center pb-3">
              <div
                class="badge badge-md"
                :class="{
                  'badge-primary': changeData.change?.status === ChangeStatus.Merged,
                  'badge-error': changeData.change?.status === ChangeStatus.Rejected,
                  'badge-warning': changeData.change?.status === ChangeStatus.Draft,
                  'badge-info': changeData.change?.status === ChangeStatus.Proposed,
                  'badge-success': changeData.change?.status === ChangeStatus.Approved,
                }"
              >
                {{ changeData.change?.status }}
              </div>
              <div class="px-4">
                {{ changeData.change?.user.username }}
                <span class="opacity-70"
                  >created on
                  {{ new Date(changeData.change?.createdAt).toLocaleDateString() }}
                </span>
              </div>
            </div>
            <Drawer v-model:open="openEditTitle">
              <DrawerContent class="min-h-[90vh]">
                <DrawerHeader class="text-left">
                  <DrawerTitle>Edit Change Details</DrawerTitle>
                </DrawerHeader>
                <FormChangeTitle
                  :data="{
                    title: changeData.change?.title || '',
                    description: changeData.change?.description || '',
                  }"
                  @submit="submitTitleForm"
                />
              </DrawerContent>
            </Drawer>
            <div class="flex flex-col" @click="openEditTitle = true">
              <h2 class="text-lg font-bold" :class="{ italic: !changeData.change?.title }">
                {{ changeData.change?.title || 'Untitled Change' }}
              </h2>
              <p
                class="text-md opacity-70"
                :class="{
                  italic: !changeData.change?.description,
                }"
              >
                {{ changeData.change?.description || 'No description provided.' }}
              </p>
            </div>
            <div v-if="changeData?.change" class="my-3 flex justify-center space-x-2">
              <button
                v-if="changeData.change.status === ChangeStatus.Draft"
                class="btn grow btn-sm btn-primary"
                @click="setStatus(ChangeStatus.Proposed)"
              >
                <font-awesome-icon icon="fa-solid fa-upload" class="mr-2 size-4" />
                Publish Change
              </button>
              <button
                v-if="changeData.change.status === ChangeStatus.Proposed"
                class="btn grow btn-sm btn-primary"
                @click="setStatus(ChangeStatus.Draft)"
              >
                <font-awesome-icon icon="fa-solid fa-pencil" class="mr-2 size-4" />
                Revert to Draft
              </button>
              <button
                v-if="changeData.change.status === ChangeStatus.Approved"
                class="btn grow btn-sm btn-primary"
                @click="mergeChange"
              >
                <font-awesome-icon icon="fa-solid fa-pencil" class="mr-2 size-4" />
                Merge Change
              </button>
              <button
                v-if="
                  changeData.change.status !== ChangeStatus.Merged &&
                  changeData.change.status !== ChangeStatus.Rejected
                "
                class="btn-danger btn btn-sm"
                @click="deleteChange"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="size-4" />
              </button>
            </div>
          </CardContent>
        </Card>
        <div class="mt-3">
          <h2 class="text-lg">Edits</h2>
          <ul v-if="changeData?.change?.edits" class="divide-y-1">
            <li
              v-for="edit in changeData.change.edits.nodes"
              :key="edit.id || edit.entityName"
              class="border-neutral-300"
            >
              <NuxtLinkLocale :to="getEditSubLink(edit as Edit)">
                <div v-if="edit.changes" class="mx-3 my-4">
                  <div class="flex items-center">
                    <div class="badge badge-sm badge-secondary">
                      {{ edit.entityName }}
                    </div>
                    <div class="flex-1 px-2">
                      <span
                        :class="{
                          italic: !((edit.changes as any).name_req || (edit.changes as any).name),
                        }"
                        >{{
                          (edit.changes as any).name_req ||
                          (edit.changes as any).name ||
                          'Unnamed Edit'
                        }}</span
                      >
                    </div>
                    <div>
                      <font-awesome-icon
                        icon="fa-solid fa-chevron-right"
                        class="text-neutral-300"
                      />
                    </div>
                  </div>
                </div>
              </NuxtLinkLocale>
            </li>
            <span
              v-if="changeData.change.edits.nodes?.length === 0"
              class="text-sm text-neutral-500"
              >No edits found</span
            >
          </ul>
          <UiList
            v-if="changeData && changeData.change?.status !== ChangeStatus.Merged"
            class="pt-4"
            :items="[
              {
                id: 'new_category',
                link: `/contribute/changes/${changeData.change?.id}/categories/new`,
                title: 'New Category',
                icon: 'fa-solid fa-plus',
              },
              {
                id: 'new_process',
                link: `/contribute/changes/${changeData.change?.id}/processes/new`,
                title: 'New Process',
                icon: 'fa-solid fa-plus',
              },
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'
import type { Edit, UpdateChangeInput } from '~/gql/types.generated'
import { ChangeStatus } from '~/gql/types.generated'

const route = useRoute()
const localeRoute = useLocaleRoute()

const openEditTitle = ref(false)

const changeQuery = graphql(`
  query ChangeQuery($id: ID!) {
    change(id: $id) {
      id
      status
      title
      description
      createdAt
      updatedAt
      user {
        id
        username
      }
      edits {
        nodes {
          id
          entityName
          original {
            ... on Variant {
              name
            }
            ... on Component {
              name
            }
            ... on Category {
              name_req: name
            }
            ... on Place {
              name
            }
            ... on Item {
              name
            }
            ... on Process {
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
            ... on Category {
              name_req: name
            }
            ... on Place {
              name
            }
            ... on Item {
              name
            }
            ... on Process {
              name
            }
          }
        }
        totalCount
      }
    }
  }
`)
const { result: changeData, refetch: refetchChangeData } = useQuery(changeQuery, {
  id: route.params.id as string,
})

const entityToPage: Record<string, string> = {
  Variant: 'variants',
  Component: 'components',
  Place: 'places',
  Category: 'categories',
  Item: 'items',
  Process: 'processes',
}

const getEditSubLink = (edit: Edit) => {
  return `/contribute/changes/${changeData.value?.change?.id}/${entityToPage[edit.entityName]}/${edit.id}`
}

const changeEditMutation = graphql(`
  mutation ChangeEditMutation($input: UpdateChangeInput!) {
    updateChange(input: $input) {
      change {
        id
      }
    }
  }
`)
const changeEdit = useMutation(changeEditMutation, {
  variables: {
    input: {
      id: route.params.id as string,
    } as UpdateChangeInput,
  },
})
const changeDeleteMutation = graphql(`
  mutation ChangeDeleteMutation($id: ID!) {
    deleteChange(id: $id) {
      success
    }
  }
`)
const changeDelete = useMutation(changeDeleteMutation, {
  variables: {
    id: route.params.id as string,
  },
})

const setStatus = async (status: ChangeStatus) => {
  await changeEdit.mutate({
    input: {
      id: route.params.id as string,
      status,
    },
  })
  await refetchChangeData()
}

const deleteChange = async () => {
  const result = await changeDelete.mutate()
  if (result?.data) {
    navigateTo(localeRoute('/contribute/changes'))
  }
}

const submitTitleForm = async (data: { title: string; description: string }) => {
  await changeEdit.mutate({
    input: {
      id: route.params.id as string,
      title: data.title,
      description: data.description,
    },
  })
  await refetchChangeData()
}

const changeMergeMutation = graphql(`
  mutation ChangeMergeMutation($id: ID!) {
    mergeChange(id: $id) {
      change {
        id
      }
    }
  }
`)
const changeMerge = useMutation(changeMergeMutation, {
  variables: {
    id: route.params.id as string,
  },
})
const mergeChange = async () => {
  const result = await changeMerge.mutate()
  if (result?.data) {
    await refetchChangeData()
  }
}
</script>
