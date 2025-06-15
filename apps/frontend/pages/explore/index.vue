<template>
  <div>
    <NavTopbar title="Explore"></NavTopbar>
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <NuxtLinkLocale to="/explore/categories">
          <div class="flex items-center">
            <h2 class="text-xl py-3 font-bold">Categories</h2>
            <font-awesome-icon
              icon="fa-solid fa-arrow-right"
              class="mx-4 text-neutral-700 font-bold"
            ></font-awesome-icon>
          </div>
        </NuxtLinkLocale>
        <Carousel class="w-full" :opts="{ align: 'start' }">
          <CarouselContent class="ml-1">
            <CarouselItem
              v-for="category in data?.rootCategory.children.nodes"
              :key="category.id"
              class="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <NuxtLinkLocale :to="`/explore/categories/${category.id}`">
                <div class="p-1">
                  <Card class="min-h-32">
                    <CardHeader class="p-4 pb-2">
                      <div class="flex flex-col items-start gap-2">
                        <UiImage
                          class="size-10 rounded-xl"
                          :src="category.image_url"
                        ></UiImage>
                        <CardTitle>{{ category.name }}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent class="flex flex-col justify-center px-4 pb-3">
                      <span class="text-xs line-clamp-2">{{
                        category.desc_short
                      }}</span>
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
    rootCategory {
      children {
        nodes {
          id
          name
          desc_short
          desc
          image_url
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
