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
    <div class="p-4 pb-0 min-h-[400px]">
      <ul class="divide-y">
        <li
          v-for="locale in locales"
          :key="locale.code"
          class="list-item py-3 dark:border-neutral-400"
          @click="selected = locale.code"
        >
          <div class="flex justify-between items-center">
            <h2>{{ locale.name }}</h2>
            <font-awesome-icon
              v-if="locale.code === selected"
              icon="fa-solid fa-check"
              class="w-4 h-4 text-neutral-500 px-2"
            />
          </div>
        </li>
      </ul>
    </div>
    <DrawerFooter>
      <DrawerClose as-child>
        <div class="flex gap-2">
          <Button class="flex-1" variant="outline"> Cancel </Button>
          <Button class="flex-1" @click="emits('select', selected)">
            Save
          </Button>
        </div>
      </DrawerClose>
    </DrawerFooter>
  </div>
</template>
