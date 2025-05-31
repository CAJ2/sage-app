<template>
  <div>
    <NavTopbar
      :title="data?.getVariant.name || 'Product'"
      :subtitle="data?.getVariant.orgs.nodes.map((o) => o.name).join(', ')"
      :use-image="true"
      :image="data?.getVariant.image_url"
      back="true"
    ></NavTopbar>
    <div class="p-3 pb-4">
      <ScoreBar :score="40"></ScoreBar>
    </div>
    <Collapsible v-model:open="recyclingOpen" class="space-y-2">
      <CollapsibleTrigger as-child>
        <div
          class="flex items-center justify-between space-x-4 p-4 border-t-1 border-b-1 border-neutral-700"
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
        <ul class="list bg-base-100 rounded-box shadow-md">
          <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Components</li>
          <li v-if="status === 'pending'" class="list-row">
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-full"></div>
          </li>

          <div v-if="recyclingResult">
            <div
              v-for="component in recyclingResult.getVariant.components.nodes"
              :key="component.id"
            >
              <li class="list-row">
                <div>
                  <img class="size-10 rounded-box" :src="component.image_url" />
                </div>
                <div>
                  <div class="text-bold">{{ component.name }}</div>
                  <div class="text-xs opacity-70">
                    {{ component.desc }}
                  </div>
                </div>
              </li>
              <div class="p-1">
                <Card v-for="re in component.recycle" :key="re.stream.name">
                  <CardHeader class="p-4 pb-2">
                    <CardTitle class="text-center">{{
                      re.stream.name
                    }}</CardTitle>
                    <div class="flex flex-col items-start gap-2 relative">
                      <img
                        v-if="re.stream.container.image"
                        :src="re.stream.container.image"
                      />
                      <img
                        v-if="re.stream.container.image"
                        :src="component.image_url"
                        class="absolute w-15 h-15 rounded-xl"
                        :style="{
                          top: `${re.stream.container.image_entry_point.y}px`,
                          left: `${re.stream.container.image_entry_point.x}px`,
                        }"
                      />
                    </div>
                  </CardHeader>
                  <CardContent class="flex flex-col justify-center px-4 pb-3">
                    <span class="text-xs line-clamp-3">{{
                      re.stream.desc
                    }}</span>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div class="divider m-1"></div>
          </div>

          <li v-else class="list-row">There are no components to show</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const recyclingOpen = ref(true)

const variantQuery = gql`
  query GetVariant($id: ID!) {
    getVariant(id: $id) {
      id
      name
      desc
      image_url
      orgs {
        nodes {
          id
          name
          desc
          avatar_url
        }
      }
      components {
        nodes {
          id
          name
          desc
          image_url
        }
      }
    }
  }
`
const variantRecycling = gql`
  query GetVariantRecycling($id: ID!, $region: ID!) {
    getVariant(id: $id) {
      id
      name
      components {
        nodes {
          id
          name
          desc
          image_url
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
`
const vars = {
  id: route.params.id,
}

type VariantResult = {
  getVariant: {
    id: string
    name: string
    desc: string
    image_url: string
    orgs: {
      nodes: {
        id: string
        name: string
        desc: string
        avatar_url: string
      }[]
    }
    components: {
      nodes: {
        id: string
        name: string
        desc: string
        image_url: string
      }[]
    }
  }
}

const { status, data } = await useLazyAsyncQuery<VariantResult>(
  variantQuery,
  vars,
)

const { result: recyclingResult, load: loadRecycling } = useLazyQuery(
  variantRecycling,
  {
    id: route.params.id,
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
