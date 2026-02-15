<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import { DrawerClose } from 'vaul-vue'

const { t } = useI18n()

const { locales, current } = defineProps<{
  locales: LocaleObject[]
  current: string
}>()

const selected = ref(current)

const emits = defineEmits<{
  (e: 'select', locale: string): void
}>()
</script>

<template>
  <div class="mx-auto w-full max-w-sm">
    <DrawerHeader>
      <DrawerTitle>{{ t('settings.language.select_title') }}</DrawerTitle>
    </DrawerHeader>
    <div class="min-h-[400px] p-4 pb-0">
      <ul class="divide-y">
        <li
          v-for="locale in locales"
          :key="locale.code"
          class="list-item py-3 dark:border-neutral-400"
          @click="selected = locale.code"
        >
          <div class="flex items-center justify-between">
            <h2>{{ locale.name }}</h2>
            <font-awesome-icon
              v-if="locale.code === selected"
              icon="fa-solid fa-check"
              class="h-4 w-4 px-2 text-neutral-500"
            />
          </div>
        </li>
      </ul>
    </div>
    <DrawerFooter>
      <DrawerClose as-child>
        <div class="flex gap-2">
          <Button class="flex-1" variant="outline"> Cancel </Button>
          <Button class="flex-1" @click="emits('select', selected)"> Save </Button>
        </div>
      </DrawerClose>
    </DrawerFooter>
  </div>
</template>
