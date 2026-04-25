<script setup lang="ts">
import { Image as ImageIcon, X as XIcon } from '@lucide/vue'
import { ref } from 'vue'

const props = defineProps<{
  images?: string[] | null
}>()

const showGallery = ref(false)

const primaryImage = computed(() => props.images?.[0] || undefined)
</script>

<template>
  <div class="relative size-20 shrink-0 cursor-pointer" @click="showGallery = true">
    <!-- Background rotated squares -->
    <div
      class="absolute inset-0 rotate-6 rounded-sm border border-base-200 bg-base-100 shadow-sm"
    ></div>
    <div
      class="absolute inset-0 -rotate-3 rounded-sm border border-base-200 bg-base-100 shadow-sm"
    ></div>

    <!-- Primary Photo -->
    <div class="relative z-10 size-full overflow-hidden rounded-sm bg-base-200 shadow-md">
      <UiImage v-if="primaryImage" :src="primaryImage" fit="cover" alt="" />
      <div v-else class="flex h-full items-center justify-center">
        <ImageIcon :size="24" class="opacity-20" />
      </div>
    </div>

    <!-- Full-screen Gallery Overlay -->
    <Teleport to="body">
      <div
        v-if="showGallery"
        class="fixed inset-0 z-100 flex flex-col bg-black/80 backdrop-blur-sm dark:bg-black/60"
        @click.self="showGallery = false"
      >
        <!-- Close Button -->
        <div class="absolute top-6 right-6 z-110">
          <Button
            size="icon"
            variant="ghost"
            class="rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            @click="showGallery = false"
          >
            <XIcon :size="24" />
          </Button>
        </div>

        <!-- Carousel -->
        <div class="flex flex-1 items-center justify-center p-4">
          <Carousel
            v-if="images && images.length > 0"
            :opts="{ loop: false }"
            class="relative w-full max-w-5xl"
          >
            <CarouselContent>
              <CarouselItem
                v-for="(img, i) in images"
                :key="i"
                class="flex h-[80vh] items-center justify-center"
              >
                <img :src="img" class="max-h-full max-w-full object-contain shadow-2xl" alt="" />
              </CarouselItem>
            </CarouselContent>

            <!-- Navigation Controls -->
            <template v-if="images.length > 1">
              <CarouselPrevious
                class="absolute top-1/2 left-4 z-120 size-14 -translate-y-1/2 border-none bg-white/20 text-white shadow-lg backdrop-blur-sm"
              />
              <CarouselNext
                class="absolute top-1/2 right-4 z-120 size-14 -translate-y-1/2 border-none bg-white/20 text-white shadow-lg backdrop-blur-sm"
              />
            </template>
          </Carousel>
          <div v-else class="flex flex-col items-center gap-4 text-white/40">
            <ImageIcon :size="64" />
            <p>No images available</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
