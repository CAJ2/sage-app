<template>
  <div>
    <NavTopbar title="Explore" />
    <div class="flex justify-center">
      <div class="w-full max-w-2xl p-5">
        <NuxtLinkLocale to="/explore/categories">
          <div class="flex items-center">
            <h2 class="py-3 text-xl font-bold">Categories</h2>
            <font-awesome-icon
              icon="fa-solid fa-arrow-right"
              class="mx-4 font-bold text-neutral-700"
            />
          </div>
        </NuxtLinkLocale>
        <Carousel class="w-full" :opts="{ align: 'start' }">
          <CarouselContent class="ml-1">
            <CarouselItem
              v-for="category in data?.categoryRoot.children.nodes"
              :key="category.id"
              class="basis-1/2 pl-1 md:basis-1/3 lg:basis-1/3"
            >
              <NuxtLinkLocale :to="`/explore/categories/${category.id}`">
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
              </NuxtLinkLocale>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const vars = {
  limit: 6,
}

const { data } = await useLazyAsyncQuery(categoriesQuery, vars)
</script>
