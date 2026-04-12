<template>
  <div class="flex min-h-dvh flex-col">
    <NavHomeLogo />
    <NuxtLink to="/profile/region">
      <NavTitleBubble :title="regionStore.regionName || 'Set Region'">
        <template #icon>
          <MapPinIcon class="size-3.5 text-accent" />
        </template>
      </NavTitleBubble>
    </NuxtLink>
    <UiPullToRefresh class="flex-1" @load="onRefresh">
      <div class="flex justify-center pt-20">
        <div class="flex w-full max-w-2xl flex-col gap-4 p-5">
          <div
            v-if="!data?.feed.nodes?.length"
            class="flex flex-col items-center gap-4 rounded-2xl bg-base-200 px-6 py-12 text-center"
          >
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-base-100 shadow-sm"
            >
              <MessageCircleDashed class="h-8 w-8 text-accent opacity-80" />
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-base font-semibold text-base-content/70">Nothing here yet</p>
              <p class="text-sm text-base-content/40">Your feed is empty. Check back soon.</p>
            </div>
          </div>
          <div v-for="item in data?.feed.nodes" :key="item.id">
            <component
              :is="item.externalLink ? 'a' : NuxtLink"
              v-bind="
                item.externalLink
                  ? { href: item.externalLink.url, target: '_blank', rel: 'noopener noreferrer' }
                  : {
                      to: item.link
                        ? `/explore/${item.link.entityName.toLowerCase()}s/${item.link.id}`
                        : '#',
                    }
              "
            >
              <Card>
                <CardHeader class="p-4 pb-2">
                  <div class="flex items-center justify-between gap-2">
                    <CardTitle class="text-base">{{ item.title }}</CardTitle>
                    <span class="badge shrink-0 badge-outline text-xs">{{ item.format }}</span>
                  </div>
                </CardHeader>
                <CardContent v-if="item.markdownShort" class="px-4 pb-3">
                  <p class="text-muted-foreground line-clamp-3 text-sm">{{ item.markdownShort }}</p>
                </CardContent>
              </Card>
            </component>
          </div>
        </div>
      </div>
    </UiPullToRefresh>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { MapPinIcon, MessageCircleDashed } from '@lucide/vue'

import { graphql } from '~/gql'

useTopbar(null)

const homeFeedQuery = graphql(`
  query HomeFeed($regionId: ID) {
    feed(regionId: $regionId) {
      nodes {
        id
        format
        title
        category
        markdownShort
        link {
          entityName
          id
        }
        externalLink {
          url
        }
      }
    }
  }
`)

const regionStore = useRegionStore()
await regionStore.load()
const { result: data, refetch } = useQuery(homeFeedQuery, () => ({
  regionId: regionStore.selectedRegion || undefined,
}))

async function onRefresh({ done }: { done: () => void }) {
  await refetch()
  done()
}
</script>
