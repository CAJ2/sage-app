<template>
  <div>
    <ul class="list">
      <li v-for="i in items" :key="i.id" class="bg-base-200">
        <NuxtLinkLocale v-if="i.link" :to="i.link" class="list-row divide-y">
          <div class="flex">
            <font-awesome-icon
              v-if="i.icon"
              :icon="i.icon"
              class="p-3 w-6 min-h-6 text-muted-foreground"
            />
            <div class="grow flex flex-col justify-around mx-2">
              <p class="text-md leading-none">
                {{ t(i.title) }}
              </p>
              <p v-if="i.subtitle" class="text-sm text-muted-foreground">
                {{ t(i.subtitle) }}
              </p>
            </div>
          </div>
        </NuxtLinkLocale>
        <div v-else class="list-row divide-y">
          <font-awesome-icon
            v-if="i.icon"
            :icon="i.icon"
            class="size-5 text-muted-foreground"
          />
          <p class="text-sm font-medium leading-none">
            {{ t(i.title) }}
          </p>
          <p v-if="i.subtitle" class="text-sm text-muted-foreground">
            {{ t(i.subtitle) }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
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
