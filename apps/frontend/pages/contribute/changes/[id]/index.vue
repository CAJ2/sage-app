<template>
  <div>
    <NavTopbar
      :title="changeData?.getChange?.title || 'Change'"
      :subtitle="changeData?.getChange?.description || undefined"
      back="true"
    ></NavTopbar>
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <Card class="mb-4">
          <CardContent v-if="changeData" class="p-4">
            <div class="flex items-center pb-3">
              <div
                class="badge badge-md"
                :class="{
                  'badge-primary':
                    changeData.getChange?.status === ChangeStatus.Merged,
                  'badge-error':
                    changeData.getChange?.status === ChangeStatus.Rejected,
                  'badge-warning':
                    changeData.getChange?.status === ChangeStatus.Draft,
                  'badge-info':
                    changeData.getChange?.status === ChangeStatus.Proposed,
                  'badge-success':
                    changeData.getChange?.status === ChangeStatus.Approved,
                }"
              >
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
                  }}
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
                    title: changeData.getChange?.title || '',
                    description: changeData.getChange?.description || '',
                  }"
                  @submit="submitTitleForm"
                ></FormChangeTitle>
              </DrawerContent>
            </Drawer>
            <div class="flex flex-col" @click="openEditTitle = true">
              <h2
                class="text-lg font-bold"
                :class="{ italic: !changeData.getChange?.title }"
              >
                {{ changeData.getChange?.title || 'Untitled Change' }}
              </h2>
              <p
                class="text-md opacity-70"
                :class="{
                  italic: !changeData.getChange?.description,
                }"
              >
                {{
                  changeData.getChange?.description ||
                  'No description provided.'
                }}
              </p>
            </div>
            <div
              v-if="changeData?.getChange"
              class="flex justify-center space-x-2 my-3"
            >
              <button
                v-if="changeData.getChange.status === ChangeStatus.Draft"
                class="grow btn btn-primary btn-sm"
                @click="setStatus(ChangeStatus.Proposed)"
              >
                <font-awesome-icon
                  icon="fa-solid fa-upload"
                  class="size-4 mr-2"
                />
                Publish Change
              </button>
              <button
                v-if="changeData.getChange.status === ChangeStatus.Proposed"
                class="grow btn btn-primary btn-sm"
                @click="setStatus(ChangeStatus.Draft)"
              >
                <font-awesome-icon
                  icon="fa-solid fa-pencil"
                  class="size-4 mr-2"
                />
                Revert to Draft
              </button>
              <button
                v-if="changeData.getChange.status === ChangeStatus.Approved"
                class="grow btn btn-primary btn-sm"
                @click="mergeChange"
              >
                <font-awesome-icon
                  icon="fa-solid fa-pencil"
                  class="size-4 mr-2"
                />
                Merge Change
              </button>
              <button
                v-if="
                  changeData.getChange.status !== ChangeStatus.Merged &&
                  changeData.getChange.status !== ChangeStatus.Rejected
                "
                class="btn btn-danger btn-sm"
                @click="deleteChange"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="size-4" />
              </button>
            </div>
          </CardContent>
        </Card>
        <div class="mt-3">
          <h2 class="text-lg">Edits</h2>
          <ul v-if="changeData?.getChange?.edits" class="divide-y-1">
            <li
              v-for="edit in changeData.getChange.edits.nodes"
              :key="edit.id || edit.entity_name"
              class="border-neutral-300"
            >
              <NuxtLinkLocale :to="getEditSubLink(edit as Edit)">
                <div v-if="edit.changes" class="my-4 mx-3">
                  <div class="flex items-center">
                    <div class="badge badge-sm badge-secondary">
                      {{ edit.entity_name }}
                    </div>
                    <div class="flex-1 px-2">
                      <span
                        :class="{
                          italic: !(
                            (edit.changes as any).name_req ||
                            (edit.changes as any).name
                          ),
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
                      ></font-awesome-icon>
                    </div>
                  </div>
                </div>
              </NuxtLinkLocale>
            </li>
            <span
              v-if="changeData.getChange.edits.nodes?.length === 0"
              class="text-neutral-500 text-sm"
              >No edits found</span
            >
          </ul>
          <UiList
            v-if="
              changeData && changeData.getChange?.status !== ChangeStatus.Merged
            "
            class="pt-4"
            :items="[
              {
                id: 'new_category',
                link: `/contribute/changes/${changeData.getChange?.id}/categories/new`,
                title: 'New Category',
                icon: 'fa-solid fa-plus',
              },
              {
                id: 'new_process',
                link: `/contribute/changes/${changeData.getChange?.id}/processes/new`,
                title: 'New Process',
                icon: 'fa-solid fa-plus',
              },
            ]"
          ></UiList>
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
        nodes {
          id
          entity_name
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
const { result: changeData, refetch: refetchChangeData } = useQuery(
  changeQuery,
  {
    id: route.params.id as string,
  },
)

const entityToPage: Record<string, string> = {
  Variant: 'variants',
  Component: 'components',
  Place: 'places',
  Category: 'categories',
  Item: 'items',
  Process: 'processes',
}

const getEditSubLink = (edit: Edit) => {
  return `/contribute/changes/${changeData.value?.getChange?.id}/${entityToPage[edit.entity_name]}/${edit.id}`
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
  } else {
    console.error('Failed to delete change:', result)
  }
}

const submitTitleForm = async (data: {
  title: string
  description: string
}) => {
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
  } else {
    console.error('Failed to merge change:', result)
  }
}
</script>
