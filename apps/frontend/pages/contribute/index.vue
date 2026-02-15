<template>
  <div>
    <NavTopbar
      :title="t('contribute.title')"
      subtitle="Help us improve the platform by contributing."
    />
    <div class="flex justify-center">
      <div class="w-full max-w-2xl p-5">
        <NuxtLinkLocale to="/contribute/changes">
          <div class="flex items-center">
            <h2 class="py-3 text-xl font-bold">Changes</h2>
            <font-awesome-icon
              icon="fa-solid fa-arrow-right"
              class="mx-4 font-bold text-base-content/70"
            />
          </div>
        </NuxtLinkLocale>
        <Carousel class="w-full" :opts="{ align: 'start' }">
          <CarouselContent class="ml-1">
            <CarouselItem
              v-for="change in result?.changes.nodes"
              :key="change.id"
              class="basis-1/2 pl-1 md:basis-1/3 lg:basis-1/3"
            >
              <NuxtLinkLocale :to="`/contribute/changes/${change.id}`">
                <div class="p-1">
                  <Card>
                    <CardHeader class="p-4 pb-2">
                      <span
                        class="badge badge-sm"
                        :class="{
                          'badge-primary': change.status === ChangeStatus.Merged,
                          'badge-error': change.status === ChangeStatus.Rejected,
                          'badge-warning': change.status === ChangeStatus.Draft,
                          'badge-info': change.status === ChangeStatus.Proposed,
                        }"
                        >{{ change.status }}</span
                      >
                      <div class="flex flex-col items-start gap-2">
                        <CardTitle>{{ change.title || 'Untitled Change' }}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent class="flex flex-col justify-center px-4 pb-3">
                      <span class="line-clamp-3 text-xs">{{
                        change.description || 'No description provided'
                      }}</span>
                    </CardContent>
                  </Card>
                </div>
              </NuxtLinkLocale>
            </CarouselItem>
            <CarouselItem
              v-if="!result?.changes.nodes?.length"
              class="basis-1/2 pl-1 md:basis-1/3 lg:basis-1/3"
            >
              <div class="p-1">
                <Card class="border-dashed">
                  <CardContent class="flex flex-col pt-4 text-sm opacity-70">
                    <font-awesome-icon icon="fa-solid fa-circle-plus" class="mb-2 text-xl" />
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
    changes(first: $first) {
      nodes {
        id
        status
        title
        description
        createdAt
        updatedAt
      }
    }
  }
`)
const { result } = useQuery(changeListQuery)
</script>
