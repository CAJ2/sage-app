<template>
  <div>
    <NavTopbar
      :title="data?.variant?.name || 'Product'"
      :subtitle="data?.variant?.orgs.nodes?.map((o) => o.org.name).join(', ')"
      :use-image="true"
      :image="data?.variant?.image_url || undefined"
      back="true"
    ></NavTopbar>
    <div class="flex flex-col p-4">
      <UiImage
        v-if="data?.variant?.image_url"
        :src="data?.variant?.image_url"
        class="rounded-box shadow-md w-32 h-32 object-cover mb-4"
      />
      <h2 class="text-lg font-semibold mb-2">{{ data?.variant?.name }}</h2>
      <p class="text-sm text-center">
        {{ data?.variant?.desc }}
      </p>
    </div>
    <Collapsible v-model:open="reuseOpen">
      <CollapsibleTrigger as-child>
        <div
          class="flex items-center justify-between space-x-4 p-3 border-t-1 border-neutral-700"
        >
          <h4 class="text-md font-semibold">Reuse</h4>
          <Button variant="ghost" size="sm" class="w-9 p-0">
            <font-awesome-icon
              icon="fa-solid fa-chevron-down"
              class="w-4 h-4 transition-transform"
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

    <Collapsible
      v-model:open="recyclingOpen"
      class="space-y-2 pb-2 border-b-1 border-neutral-700"
    >
      <CollapsibleTrigger as-child>
        <div
          class="flex items-center justify-between space-x-4 p-3 mb-0 border-t-1 border-b-0 border-neutral-700"
        >
          <h4 class="text-md font-semibold">Recycle</h4>
          <Button variant="ghost" size="sm" class="w-9 p-0">
            <font-awesome-icon
              icon="fa-solid fa-chevron-down"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': recyclingOpen }"
            />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent class="space-y-2">
        <div v-if="recyclingResult" class="px-3 pb-4">
          <ScoreBar
            size="medium"
            :score="recyclingResult.variant?.recycle_score?.score"
          ></ScoreBar>
        </div>
        <ul class="list bg-base-100 rounded-box shadow-md">
          <li class="px-4 pb-2 text-sm opacity-80 tracking-wide">Components</li>
          <div class="divider my-0"></div>
          <li v-if="status === 'pending'" class="list-row">
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-full"></div>
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
                    :src="component.component.image_url || undefined"
                  />
                </div>
                <div>
                  <div class="text-bold">{{ component.component.name }}</div>
                  <div class="text-xs opacity-70">
                    {{ component.component.desc }}
                  </div>
                </div>
              </li>
              <div class="px-3">
                <ScoreBar
                  size="small"
                  :score="component.component.recycle_score?.score"
                  :rating="component.component.recycle_score?.rating"
                  :rating-fmt="component.component.recycle_score?.rating_f"
                ></ScoreBar>
              </div>
              <RecycleContainer
                v-for="recycle in component.component.recycle"
                :key="recycle.stream?.name || undefined"
                :image="component.component.image_url"
                :recycle="recycle"
              ></RecycleContainer>
            </div>
          </div>

          <li v-else class="list-row">
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
      image_url
      orgs {
        nodes {
          org {
            id
            name
            desc
            avatar_url
          }
        }
      }
      components {
        nodes {
          component {
            id
            name
            desc
            image_url
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
      recycle_score(region_id: $region) {
        score
        rating
        rating_f
      }
      components {
        nodes {
          component {
            id
            name
            desc
            image_url
            recycle_score(region_id: $region) {
              score
              rating
              rating_f
            }
            recycle(region_id: $region) {
              context {
                key
                desc
              }
              stream {
                name
                desc
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
                  image_entry_point {
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

const { status, data } = await useLazyAsyncQuery(variantQuery, vars)

const { result: recyclingResult, load: loadRecycling } = useLazyQuery(
  variantRecycling,
  {
    id:
      typeof route.params.id === 'string'
        ? route.params.id
        : route.params.id[0],
    region: useRegionStore().selectedRegion,
  },
)
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
