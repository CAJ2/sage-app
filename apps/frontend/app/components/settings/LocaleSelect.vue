<script setup lang="ts">
import { Check } from '@lucide/vue'
import { useTranslate } from '@tolgee/vue'
import { DrawerClose } from 'vaul-vue'

const { t } = useTranslate('common')

interface LocaleObject {
  code: string
  name: string
}

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
    <div class="overflow-y-auto px-4 pb-0" style="max-height: 60vh">
      <ul class="flex flex-col gap-1">
        <li
          v-for="locale in locales"
          :key="locale.code"
          class="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-colors"
          :class="
            locale.code === selected
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-base-200 active:bg-base-300'
          "
          @click="selected = locale.code"
        >
          <span class="font-medium">{{ locale.name }}</span>
          <Check v-if="locale.code === selected" class="size-4 text-primary" />
        </li>
      </ul>
    </div>
    <DrawerFooter class="pb-6">
      <DrawerClose as-child>
        <Button class="w-full" @click="emits('select', selected)"> Save </Button>
      </DrawerClose>
    </DrawerFooter>
  </div>
</template>
