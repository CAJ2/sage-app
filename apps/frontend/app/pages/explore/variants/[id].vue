<template>
  <div>
    <NavBackBubble />
    <NavTitleBubble :title="data?.variant?.name ?? undefined" :subtitle="orgSubtitle" />

    <!-- Full-bleed image carousel -->
    <div class="relative h-64 bg-base-200">
      <Carousel
        v-if="carouselImages.length > 0"
        class="h-full w-full"
        :opts="{ loop: true, dragFree: false, align: 'start' }"
      >
        <CarouselContent class="h-full" :style="{ marginLeft: '0' }">
          <CarouselItem
            v-for="(img, i) in carouselImages"
            :key="i"
            class="h-64 basis-full"
            :style="{ paddingLeft: '0' }"
          >
            <img :src="img" class="block h-full w-full object-cover" alt="" />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <div v-else class="flex h-full items-center justify-center">
        <ImageIcon :size="64" class="opacity-20" />
      </div>
    </div>

    <!-- Sheet overlapping carousel -->
    <div class="relative z-0 -mt-8 rounded-t-3xl bg-base-100 pb-4 shadow-xl">
      <!-- Name & desc -->
      <div class="px-4 pt-5 pb-2">
        <h1 class="text-xl font-bold">{{ data?.variant?.name }}</h1>
        <p v-if="data?.variant?.desc" class="mt-1 text-sm text-base-content/70">
          {{ data?.variant?.desc }}
        </p>
      </div>

      <!-- Sticky scroll nav -->
      <div class="sticky top-0 z-1 bg-base-100">
        <VariantScrollNav v-model="activeTab" :tabs="tabs" />
      </div>

      <!-- Tab content -->
      <div class="mt-2">
        <!-- Reuse -->
        <div v-if="activeTab === 'reuse'" class="px-4 py-4 text-center text-sm opacity-60">
          No suggestions available.
        </div>

        <!-- Recycle -->
        <div v-if="activeTab === 'recycle'">
          <div v-if="recyclingResult" class="px-4 pb-2">
            <ScoreBar size="medium" :score="recyclingResult.variant?.recycleScore?.score" />
          </div>

          <div v-if="loadingRecycling" class="space-y-3 px-4">
            <div class="h-4 w-28 skeleton" />
            <div class="h-4 w-full skeleton" />
            <div class="h-4 w-full skeleton" />
          </div>

          <div
            v-else-if="recyclingResult?.variant?.components.nodes?.length"
            class="space-y-3 px-3"
          >
            <div
              v-for="vc in recyclingResult.variant.components.nodes"
              :key="vc.component.id"
              class="rounded-box bg-base-200 p-3 shadow-sm"
            >
              <div class="mb-3 flex items-center gap-3">
                <UiImage
                  class="size-10 shrink-0 rounded-box"
                  :src="vc.component.imageURL || undefined"
                />
                <div>
                  <div class="text-sm font-semibold">{{ vc.component.name }}</div>
                  <div class="line-clamp-2 text-xs opacity-60">{{ vc.component.desc }}</div>
                </div>
              </div>
              <template v-if="vc.component.recycle?.length">
                <RecycleContainer
                  v-for="recycle in vc.component.recycle"
                  :key="recycle.stream?.name || undefined"
                  :image="vc.component.imageURL"
                  :recycle="recycle"
                />
              </template>
              <div v-else class="mt-2 flex items-center gap-3 rounded-box bg-base-100 p-3">
                <CircleHelpIcon :size="24" class="shrink-0 opacity-40" />
                <div>
                  <div class="text-sm font-medium">Instructions Unknown</div>
                  <div class="text-xs opacity-60">
                    No recycling data available for this component.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-else-if="!loadingRecycling" class="px-4 py-4 text-center text-sm opacity-60">
            Recycling instructions are currently not available.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleHelp as CircleHelpIcon, Image as ImageIcon } from 'lucide-vue-next'
import { graphql } from '~/gql'

const route = useRoute()

const activeTab = ref<'reuse' | 'recycle'>('recycle')
const tabs = [
  { id: 'reuse', label: 'Reuse' },
  { id: 'recycle', label: 'Recycle' },
]

const variantQuery = graphql(`
  query GetVariant($id: ID!) {
    variant(id: $id) {
      id
      name
      desc
      imageURL
      images {
        nodes {
          url
        }
      }
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
  query GetVariantRecycling($id: ID!) {
    variant(id: $id) {
      id
      name
      recycleScore {
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
            recycleScore {
              score
              rating
              ratingF
            }
            recycle {
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
  id: typeof route.params.id === 'string' ? route.params.id : route.params.id?.[0] || '',
}

const { result: data } = useQuery(variantQuery, vars)

const carouselImages = computed<string[]>(() => {
  const nodes = data.value?.variant?.images?.nodes
  if (nodes && nodes.length > 0) return nodes.map((n) => n.url)
  if (data.value?.variant?.imageURL) return [data.value.variant.imageURL]
  return []
})

const orgSubtitle = computed(
  () => data.value?.variant?.orgs.nodes?.map((o) => o.org.name).join(', ') ?? undefined,
)

const recentStore = useRecentStore()
onMounted(() => {
  recentStore.add({ id: vars.id, __typename: 'Variant' })
})

const regionStore = useRegionStore()
regionStore.load()
const {
  result: recyclingResult,
  load: loadRecycling,
  loading: loadingRecycling,
} = useLazyQuery(variantRecycling, {
  id: typeof route.params.id === 'string' ? route.params.id : route.params.id?.[0] || '',
})
watch(
  activeTab,
  async (tab) => {
    if (tab === 'recycle') {
      await loadRecycling()
    }
  },
  { immediate: true },
)
</script>
