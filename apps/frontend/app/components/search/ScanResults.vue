<template>
  <Card class="bg-base-100">
    <CardContent class="p-3">
      <Carousel :opts="{ align: 'start' }">
        <CarouselContent class="-ml-2">
          <CarouselItem v-for="v in variants" :key="v.id" class="basis-1/3 pl-2">
            <NuxtLink :to="`/explore/variants/${v.id}`">
              <Card class="overflow-hidden">
                <div class="flex flex-col">
                  <img
                    v-if="v.imageURL"
                    class="aspect-square w-full object-cover"
                    :src="v.imageURL"
                  />
                  <span
                    v-else
                    class="flex aspect-square w-full items-center justify-center border-b border-neutral-200"
                  >
                    <font-awesome-icon icon="fa-solid fa-tags" class="size-8 opacity-30" />
                  </span>
                  <div class="min-w-0 p-2">
                    <div class="truncate text-sm font-semibold">{{ v.name }}</div>
                    <div class="truncate text-xs opacity-60">{{ v.desc }}</div>
                  </div>
                </div>
              </Card>
            </NuxtLink>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
export type ScanVariant = {
  id: string
  name: string
  desc: string
  imageURL: string
}

defineProps<{
  variants: ScanVariant[]
}>()
</script>
