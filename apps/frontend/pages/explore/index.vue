<template>
  <div>
    <NavTopbar title="Explore"></NavTopbar>
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <NuxtLink to="/explore/categories">
          <div class="flex items-center">
            <h2 class="text-xl py-3 font-bold">Categories</h2>
            <font-awesome-icon
              icon="fa-solid fa-arrow-right"
              class="mx-4 text-neutral-700 font-bold"
            ></font-awesome-icon>
          </div>
        </NuxtLink>
        <Carousel class="w-full" :opts="{ align: 'start' }">
          <CarouselContent class="ml-1">
            <CarouselItem
              v-for="(_, index) in 5"
              :key="index"
              class="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <div class="p-1">
                <Card>
                  <CardHeader class="p-4">
                    <div class="flex flex-col items-start gap-2">
                      <font-awesome-icon
                        icon="fa-solid fa-home"
                        class="text-neutral-700"
                      ></font-awesome-icon>
                      <CardTitle>Category {{ index + 1 }}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent class="flex flex-col justify-center px-4 pb-2">
                    <span class="text-xl">{{ index + 1 }}</span>
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

<script setup lang="ts"></script>
