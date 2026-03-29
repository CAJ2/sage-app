<template>
  <div>
    <div class="flex justify-center px-4 py-4">
      <div class="flex w-full max-w-lg flex-col gap-3">
        <!-- Language -->
        <Drawer>
          <DrawerTrigger as-child>
            <button class="w-full text-left">
              <Card class="bg-base-200">
                <CardContent
                  class="flex items-center gap-4 px-5 py-4 transition-colors active:bg-base-300"
                >
                  <div class="text-accent">
                    <GlobeIcon class="size-5" />
                  </div>
                  <div class="flex flex-1 flex-col">
                    <h2 class="font-medium">Language</h2>
                    <p class="text-xs opacity-60">
                      {{ locales.find((l) => l.code === locale)?.name }}
                    </p>
                  </div>
                  <ChevronDownIcon class="size-4 opacity-40" />
                </CardContent>
              </Card>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <SettingsLocaleSelect
              :locales="locales"
              :current="locale"
              @select="setLocale($event as any)"
            />
          </DrawerContent>
        </Drawer>

        <!-- Theme -->
        <Card class="bg-base-200">
          <CardContent class="flex items-center gap-4 px-5 py-4">
            <div class="text-accent">
              <SunMoonIcon class="size-5" />
            </div>
            <div class="flex-1 font-medium">Theme</div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button class="btn gap-1 btn-ghost btn-sm">
                  {{ themeLabel }}
                  <ChevronDownIcon class="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="min-w-36">
                <DropdownMenuItem
                  v-for="option in themeOptions"
                  :key="option.value"
                  :class="{ 'bg-base-200': colorMode === option.value }"
                  @click="colorMode = option.value"
                >
                  {{ option.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, GlobeIcon, SunMoonIcon } from '@lucide/vue'
import { useTolgee } from '@tolgee/vue'
import { useColorMode } from '@vueuse/core'
import { DrawerTrigger } from 'vaul-vue'
import { computed } from 'vue'

useTopbar({ title: 'App Settings', back: 'true' })

const tolgee = useTolgee(['language'])
const locale = computed(() => tolgee.value.getLanguage() ?? 'en')
const locales = [
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Svenska' },
]
const setLocale = (code: string) => tolgee.value.changeLanguage(code)

const colorMode = useColorMode({
  selector: 'html',
  attribute: 'data-theme',
  modes: { light: 'light', dark: 'dark' },
})

const themeOptions = [
  { value: 'auto', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const

const themeLabel = computed(
  () => themeOptions.find((o) => o.value === colorMode.value)?.label ?? 'System',
)
</script>
