<template>
  <div>
    <NavTopbar title="App Settings" back="true" />
    <div class="grid grid-cols-4 md:grid-cols-12">
      <div class="col-span-4 flex flex-col gap-0 py-3 md:col-span-6 md:col-start-4">
        <div class="card bg-base-100 shadow-md">
          <div class="card-body gap-0 p-0">
            <!-- Language row -->
            <Drawer>
              <DrawerTrigger as-child>
                <button class="flex w-full items-center gap-3 p-4">
                  <div class="text-accent">
                    <GlobeIcon class="size-6" />
                  </div>
                  <div class="flex flex-1 flex-col text-left">
                    <h2 class="font-medium">Language</h2>
                    <p class="text-xs opacity-70">
                      {{ locales.find((l) => l.code === locale)?.name }}
                    </p>
                  </div>
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

            <div class="divider my-0 px-4" />

            <!-- Theme row -->
            <div class="flex items-center gap-3 p-4">
              <div class="text-accent">
                <SunMoonIcon class="size-6" />
              </div>
              <div class="flex-1 font-medium">Theme</div>
              <div class="dropdown dropdown-end">
                <button tabindex="0" class="btn gap-1 btn-ghost btn-sm">
                  {{ themeLabel }}
                  <ChevronDownIcon class="size-3.5" />
                </button>
                <ul
                  tabindex="0"
                  class="dropdown-content menu z-10 w-36 rounded-box bg-base-100 p-1 shadow-md"
                >
                  <li v-for="option in themeOptions" :key="option.value">
                    <button
                      :class="{ active: colorMode === option.value }"
                      @click="colorMode = option.value"
                    >
                      {{ option.label }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { DrawerTrigger } from 'vaul-vue'
import { ChevronDownIcon, GlobeIcon, SunMoonIcon } from 'lucide-vue-next'
import { computed } from 'vue'

const { locale, locales, setLocale } = useI18n()

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
