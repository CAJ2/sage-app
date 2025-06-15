<template>
  <div>
    <NavTopbar
      :title="t('contribute.title')"
      subtitle="Help us improve the platform by contributing."
    ></NavTopbar>
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <NuxtLinkLocale to="/contribute/changes">
          <div class="flex items-center">
            <h2 class="text-xl py-3 font-bold">Changes</h2>
            <font-awesome-icon
              icon="fa-solid fa-arrow-right"
              class="mx-4 text-base-content/70 font-bold"
            ></font-awesome-icon>
          </div>
        </NuxtLinkLocale>
        <Carousel class="w-full" :opts="{ align: 'start' }">
          <CarouselContent class="ml-1">
            <CarouselItem
              v-for="change in result?.getChanges.nodes"
              :key="change.id"
              class="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <NuxtLinkLocale :to="`/contribute/changes/${change.id}`">
                <div class="p-1">
                  <Card>
                    <CardHeader class="p-4 pb-2">
                      <span
                        class="badge badge-sm"
                        :class="{
                          'badge-primary':
                            change.status === ChangeStatus.Merged,
                          'badge-error':
                            change.status === ChangeStatus.Rejected,
                          'badge-warning': change.status === ChangeStatus.Draft,
                          'badge-info': change.status === ChangeStatus.Proposed,
                        }"
                        >{{ change.status }}</span
                      >
                      <div class="flex flex-col items-start gap-2">
                        <CardTitle>{{
                          change.title || 'Untitled Change'
                        }}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent class="flex flex-col justify-center px-4 pb-3">
                      <span class="text-xs line-clamp-3">{{
                        change.description || 'No description provided'
                      }}</span>
                    </CardContent>
                  </Card>
                </div>
              </NuxtLinkLocale>
            </CarouselItem>
            <CarouselItem
              v-if="!result?.getChanges.nodes?.length"
              class="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <div class="p-1">
                <Card class="border-dashed">
                  <CardContent class="flex flex-col opacity-70 text-sm pt-4">
                    <font-awesome-icon
                      icon="fa-solid fa-circle-plus"
                      class="text-xl mb-2"
                    ></font-awesome-icon>
                    Changes will show up here when you make an edit
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'
import { ChangeStatus } from '~/gql/types.generated'

const { t } = useI18n()

const changeListQuery = graphql(`
  query ContributeIndexGetChanges($first: Int) {
    getChanges(first: $first) {
      nodes {
        id
        status
        title
        description
        created_at
        updated_at
      }
    }
  }
`)
const { result } = useQuery(changeListQuery)
</script>
