<template>
  <nav
    class="relative flex items-center justify-around justify-items-center bg-base-200 pb-[env(safe-area-inset-bottom)]"
  >
    <!-- Left Tabs -->
    <div class="flex flex-1 justify-center">
      <NuxtLink :to="{ path: tabs.home }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === tabs.home,
            'text-base-content': activeTab !== tabs.home,
          }"
        >
          <HouseIcon :size="20" />
          <span class="text-sm"><T ns="frontend" key-name="tabs.home" /></span>
        </button>
      </NuxtLink>
    </div>
    <div class="flex flex-1 justify-center">
      <NuxtLink :to="{ path: tabs.explore }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === tabs.explore,
            'text-base-content': activeTab !== tabs.explore,
          }"
        >
          <GlobeIcon :size="20" />
          <span class="text-sm"><T ns="frontend" key-name="tabs.explore" /></span>
        </button>
      </NuxtLink>
    </div>

    <!-- Center Search Button -->
    <div class="inset-x-0 top-0 -translate-y-1/4 px-3">
      <NuxtLink
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
      </NuxtLink>
    </div>

    <!-- Right Tabs -->
    <div class="flex flex-1 justify-center">
      <NuxtLink :to="{ path: tabs.contribute }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === tabs.contribute,
            'text-base-content': activeTab !== tabs.contribute,
          }"
        >
          <MessageCirclePlusIcon :size="20" />
          <span class="text-sm"><T ns="frontend" key-name="tabs.contribute" /></span>
        </button>
      </NuxtLink>
    </div>
    <div class="flex flex-1 justify-center">
      <NuxtLink :to="{ path: tabs.profile }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === tabs.profile,
            'text-base-content': activeTab !== tabs.profile,
          }"
        >
          <UserSquareIcon :size="20" />
          <span class="text-sm"><T ns="frontend" key-name="tabs.profile" /></span>
        </button>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  Globe as GlobeIcon,
  House as HouseIcon,
  MessageCirclePlus as MessageCirclePlusIcon,
  UserRound as UserSquareIcon,
} from '@lucide/vue'
import { T } from '@tolgee/vue'

const route = useRoute()

const tabs = {
  home: '/home',
  explore: '/explore',
  contribute: '/contribute',
  profile: '/profile',
}

const activeTab = computed(() => {
  const currentPath = route.path
  return Object.values(tabs).find((path) => currentPath.startsWith(path)) ?? null
})
</script>
