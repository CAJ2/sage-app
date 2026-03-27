<template>
  <div>
    <ul class="list">
      <li v-for="i in items" :key="i.id" class="bg-base-200">
        <NuxtLink v-if="i.link" :to="i.link" class="list-row divide-y">
          <div class="flex">
            <font-awesome-icon
              v-if="i.icon"
              :icon="i.icon"
              class="text-muted-foreground min-h-6 w-6 p-3"
            />
            <div class="mx-2 flex grow flex-col justify-around">
              <p class="text-md leading-none">
                {{ t(i.title) }}
              </p>
              <p v-if="i.subtitle" class="text-muted-foreground text-sm">
                {{ t(i.subtitle) }}
              </p>
            </div>
          </div>
        </NuxtLink>
        <div v-else class="list-row divide-y">
          <font-awesome-icon v-if="i.icon" :icon="i.icon" class="text-muted-foreground size-5" />
          <p class="text-sm leading-none font-medium">
            {{ t(i.title) }}
          </p>
          <p v-if="i.subtitle" class="text-muted-foreground text-sm">
            {{ t(i.subtitle) }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useTranslate } from '@tolgee/vue'

const { t } = useTranslate('common')
const { items } = defineProps<{
  items: {
    id: string
    link?: string
    title: string
    subtitle?: string
    icon?: string
  }[]
}>()
</script>
