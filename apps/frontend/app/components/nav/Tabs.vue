<template>
  <nav class="relative flex items-center justify-around justify-items-center bg-base-200">
    <!-- Left Tabs -->
    <div class="flex flex-1 justify-center">
      <NuxtLinkLocale :to="{ path: leftTabs['home'].path }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === leftTabs['home'].path,
            'text-base-content': activeTab !== leftTabs['home'].path,
          }"
        >
          <HouseIcon :size="20" />
          <span class="text-sm">{{ leftTabs['home'].label }}</span>
        </button>
      </NuxtLinkLocale>
    </div>
    <div class="flex flex-1 justify-center">
      <NuxtLinkLocale :to="{ path: leftTabs['explore'].path }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === leftTabs['explore'].path,
            'text-base-content': activeTab !== leftTabs['explore'].path,
          }"
        >
          <GlobeIcon :size="20" />
          <span class="text-sm">{{ leftTabs['explore'].label }}</span>
        </button>
      </NuxtLinkLocale>
    </div>

    <!-- Center Search Button -->
    <div class="inset-x-0 top-0 -translate-y-1/4 px-3">
      <NuxtLinkLocale
        :to="{ path: '/search' }"
        class="flex items-center justify-center"
        @dragstart.prevent
      >
        <Button
          class="h-16 w-16 rounded-full border-0 p-0 shadow-[0_0px_10px_rgba(0,0,0,0.25)] shadow-neutral-500 dark:shadow-neutral-900"
          aria-label="Search"
        >
          <svg
            class="h-6! w-6!"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="m16.325 14.899l5.38 5.38a1.008 1.008 0 0 1-1.427 1.426l-5.38-5.38a8 8 0 1 1 1.426-1.426M10 16a6 6 0 1 0 0-12a6 6 0 0 0 0 12"
            />
          </svg>
        </Button>
      </NuxtLinkLocale>
    </div>

    <!-- Right Tabs -->
    <div class="flex flex-1 justify-center">
      <NuxtLinkLocale :to="{ path: rightTabs['contribute'].path }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === rightTabs['contribute'].path,
            'text-base-content': activeTab !== rightTabs['contribute'].path,
          }"
        >
          <MessageCirclePlusIcon :size="20" />
          <span class="text-sm">{{ rightTabs['contribute'].label }}</span>
        </button>
      </NuxtLinkLocale>
    </div>
    <div class="flex flex-1 justify-center">
      <NuxtLinkLocale :to="{ path: rightTabs['profile'].path }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === rightTabs['profile'].path,
            'text-base-content': activeTab !== rightTabs['profile'].path,
          }"
        >
          <UserSquareIcon :size="20" />
          <span class="text-sm">{{ rightTabs['profile'].label }}</span>
        </button>
      </NuxtLinkLocale>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  Globe as GlobeIcon,
  House as HouseIcon,
  MessageCirclePlus as MessageCirclePlusIcon,
  UserRound as UserSquareIcon,
} from 'lucide-vue-next'

const route = useRoute()
const { t } = useI18n()

const leftTabs = computed(() => ({
  home: {
    path: '/home',
    label: t('tabs.home'),
  },
  explore: {
    path: '/explore',
    label: t('tabs.explore'),
  },
}))
const rightTabs = computed(() => ({
  contribute: {
    path: '/contribute',
    label: t('tabs.contribute'),
  },
  profile: {
    path: '/profile',
    label: t('tabs.profile'),
  },
}))

const localePath = useLocalePath()

const activeTab = computed(() => {
  const currentPath = localePath(route.path, 'en')
  const currentTab = [
    leftTabs.value['home'],
    leftTabs.value['explore'],
    rightTabs.value['contribute'],
    rightTabs.value['profile'],
  ].find((tab) => {
    return currentPath.startsWith(tab.path)
  })
  return currentTab ? currentTab.path : null
})
</script>
