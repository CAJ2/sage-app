<template>
  <div>
    <NavTopbar title="Home" />
    <div class="flex justify-center">
      <div class="flex w-full max-w-2xl flex-col gap-4 p-5">
        <div v-for="item in data?.feed.nodes" :key="item.id">
          <component
            :is="item.externalLink ? 'a' : NuxtLinkLocale"
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
                  <span class="badge-outline badge shrink-0 text-xs">{{ item.format }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'
import { NuxtLinkLocale } from '#components'

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
const { data } = await useLazyAsyncQuery(homeFeedQuery, {
  regionId: regionStore.selectedRegion || undefined,
})
</script>
