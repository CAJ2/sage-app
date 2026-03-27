<template>
  <div>
    <NavTopbar title="Explore" />
    <div class="flex justify-center">
      <div class="w-full max-w-2xl p-5">
        <NuxtLink to="/explore/places">
          <Button variant="outline" class="mb-4 w-full">
            <MapIcon />
            View Map
          </Button>
        </NuxtLink>
        <NuxtLink to="/explore/categories">
          <div class="flex items-center">
            <h2 class="py-3 text-xl font-bold">Categories</h2>
            <ArrowRight class="mx-4 font-bold text-neutral-700" />
          </div>
        </NuxtLink>
        <Carousel class="w-full" :opts="{ align: 'start' }">
          <CarouselContent class="ml-1">
            <CarouselItem
              v-for="category in data?.categoryRoot.children.nodes"
              :key="category.id"
              class="basis-1/2 pl-1 md:basis-1/3 lg:basis-1/3"
            >
              <NuxtLink :to="`/explore/categories/${category.id}`">
                <div class="p-1">
                  <Card class="min-h-32">
                    <CardHeader class="p-4 pb-2">
                      <div class="flex flex-col items-start gap-2">
                        <UiImage class="size-10 rounded-xl" :src="category.imageURL" />
                        <CardTitle>{{ category.name }}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent class="flex flex-col justify-center px-4 pb-3">
                      <span class="line-clamp-2 text-xs">{{ category.descShort }}</span>
                    </CardContent>
                  </Card>
                </div>
              </NuxtLink>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Map as MapIcon } from '@lucide/vue'

import { graphql } from '~/gql'

const categoriesQuery = graphql(`
  query GetCategories {
    categoryRoot {
      children {
        nodes {
          id
          name
          descShort
          desc
          imageURL
        }
      }
    }
  }
`)
const { result: data } = useQuery(categoriesQuery)
</script>
