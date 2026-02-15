<template>
  <div>
    <NavTopbar
      :title="data?.variant?.name || 'Product'"
      :subtitle="data?.variant?.orgs.nodes?.map((o) => o.org.name).join(', ')"
      :use-image="true"
      :image="data?.variant?.imageURL || undefined"
      back="true"
    />
    <div class="flex flex-col p-4">
      <UiImage
        v-if="data?.variant?.imageURL"
        :src="data?.variant?.imageURL"
        class="mb-4 h-32 w-32 rounded-box object-cover shadow-md"
      />
      <h2 class="mb-2 text-lg font-semibold">{{ data?.variant?.name }}</h2>
      <p class="text-center text-sm">
        {{ data?.variant?.desc }}
      </p>
    </div>
    <Collapsible v-model:open="reuseOpen">
      <CollapsibleTrigger as-child>
        <div class="flex items-center justify-between space-x-4 border-t-1 border-neutral-700 p-3">
          <h4 class="text-md font-semibold">Reuse</h4>
          <Button variant="ghost" size="sm" class="w-9 p-0">
            <font-awesome-icon
              icon="fa-solid fa-chevron-down"
              class="h-4 w-4 transition-transform"
              :class="{ 'rotate-180': reuseOpen }"
            />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent class="space-y-2">
        <div class="p-3 pb-4 text-center">
          <span class="text-md">No suggestions available.</span>
        </div>
      </CollapsibleContent>
    </Collapsible>

    <Collapsible v-model:open="recyclingOpen" class="space-y-2 border-b-1 border-neutral-700 pb-2">
      <CollapsibleTrigger as-child>
        <div
          class="mb-0 flex items-center justify-between space-x-4 border-t-1 border-b-0 border-neutral-700 p-3"
        >
          <h4 class="text-md font-semibold">Recycle</h4>
          <Button variant="ghost" size="sm" class="w-9 p-0">
            <font-awesome-icon
              icon="fa-solid fa-chevron-down"
              class="h-4 w-4 transition-transform"
              :class="{ 'rotate-180': recyclingOpen }"
            />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent class="space-y-2">
        <div v-if="recyclingResult" class="px-3 pb-4">
          <ScoreBar size="medium" :score="recyclingResult.variant?.recycleScore?.score" />
        </div>
        <ul class="list rounded-box bg-base-100 shadow-md">
          <li class="px-4 pb-2 text-sm tracking-wide opacity-80">Components</li>
          <div class="divider my-0" />
          <li v-if="loadingRecycling" class="list-row">
            <div class="h-4 w-28 skeleton" />
            <div class="h-4 w-full skeleton" />
            <div class="h-4 w-full skeleton" />
          </li>

          <div
            v-if="
              recyclingResult?.variant?.components.nodes &&
              recyclingResult.variant.components.nodes.length > 0
            "
          >
            <div
              v-for="component in recyclingResult.variant.components.nodes"
              :key="component.component.id"
            >
              <li class="list-row">
                <div>
                  <UiImage
                    class="size-10 rounded-box"
                    :src="component.component.imageURL || undefined"
                  />
                </div>
                <div>
                  <div class="text-bold">{{ component.component.name }}</div>
                  <div class="text-xs opacity-70">
                    {{ component.component.desc }}
                  </div>
                </div>
              </li>
              <RecycleContainer
                v-for="recycle in component.component.recycle"
                :key="recycle.stream?.name || undefined"
                :image="component.component.imageURL"
                :recycle="recycle"
              />
            </div>
          </div>

          <li
            v-if="
              !loadingRecycling &&
              (!recyclingResult?.variant?.components.nodes ||
                recyclingResult.variant.components.nodes.length <= 0)
            "
            class="list-row"
          >
            Recycling instructions are currently not available
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const route = useRoute()

const reuseOpen = ref(false)
const recyclingOpen = ref(true)

const variantQuery = graphql(`
  query GetVariant($id: ID!) {
    variant(id: $id) {
      id
      name
      desc
      imageURL
      orgs {
        nodes {
          org {
            id
            name
            desc
            avatarURL
          }
        }
      }
      components {
        nodes {
          component {
            id
            name
            desc
            imageURL
          }
        }
      }
    }
  }
`)
const variantRecycling = graphql(`
  query GetVariantRecycling($id: ID!, $region: ID!) {
    variant(id: $id) {
      id
      name
      recycleScore(regionID: $region) {
        score
        rating
        ratingF
      }
      components {
        nodes {
          component {
            id
            name
            desc
            imageURL
            recycleScore(regionID: $region) {
              score
              rating
              ratingF
            }
            recycle(regionID: $region) {
              context {
                key
                desc
              }
              stream {
                name
                desc
                score {
                  score
                  rating
                  ratingF
                }
                container {
                  type
                  access
                  shape {
                    width
                    height
                    depth
                  }
                  color
                  image
                  imageEntryPoint {
                    x
                    y
                    side
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`)
const vars = {
  id: route.params.id,
}

const { data } = await useLazyAsyncQuery(variantQuery, vars)

const {
  result: recyclingResult,
  load: loadRecycling,
  loading: loadingRecycling,
} = useLazyQuery(variantRecycling, {
  id: typeof route.params.id === 'string' ? route.params.id : route.params.id[0],
  region: useRegionStore().selectedRegion,
})
watch(
  recyclingOpen,
  async (open) => {
    if (open) {
      await loadRecycling()
    }
  },
  { immediate: true },
)
</script>
