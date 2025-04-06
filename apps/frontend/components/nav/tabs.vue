<template>
  <div class="flex items-center justify-around bg-base-200 p-3 relative">
    <!-- Left Tabs -->
    <div class="space-x-4">
      <button
        v-for="(tab, index) in leftTabs"
        :key="index"
        class="flex-1 items-center p-1"
        :class="{
          'text-accent border-b-2 border-primary': activeTab === tab.path,
          'text-base-content': activeTab !== tab.path,
        }"
      >
        <router-link
          :to="{ path: tab.path }"
          class="flex flex-col items-center"
        >
          <font-awesome-icon :icon="tab.icon" class="w-6 h-6" />
          <span class="text-sm">{{ tab.label }}</span>
        </router-link>
      </button>
    </div>

    <!-- Center Search Button -->
    <div class="absolute inset-x-0 top-0 flex justify-center -translate-y-1/3">
      <button class="w-16 h-16 btn btn-primary rounded-full">
        <router-link
          :to="{ path: '/search' }"
          class="flex items-center justify-center"
        >
          <font-awesome-icon
            icon="fa-solid fa-magnifying-glass"
            class="w-8 h-8"
          />
        </router-link>
      </button>
    </div>

    <!-- Right Tabs -->
    <div class="align-end space-x-4">
      <button
        v-for="(tab, index) in rightTabs"
        :key="index"
        class="flex-1 items-center p-y-1"
        :class="{
          'text-primary border-b-2 border-primary': activeTab === tab.path,
          'text-base-content': activeTab !== tab.path,
        }"
      >
        <router-link
          :to="{ path: tab.path }"
          class="flex flex-col items-center"
        >
          <font-awesome-icon :icon="tab.icon" class="w-6 h-6" />
          <span class="text-sm">{{ tab.label }}</span>
        </router-link>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const leftTabs = [
  {
    path: '/explore',
    label: 'Explore',
    icon: 'fa-regular fa-folder',
  },
  {
    path: '/places',
    label: 'Places',
    icon: 'fa-regular fa-flag',
  },
]
const rightTabs = [
  {
    path: '/contribute',
    label: 'Contribute',
    icon: 'fa-solid fa-circle-plus',
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: 'fa-regular fa-user',
  },
]

const activeTab = computed(() => {
  const currentPath = route.path
  const currentTab = [...leftTabs, ...rightTabs].find((tab) => {
    return currentPath.startsWith(tab.path)
  })
  return currentTab ? currentTab.path : null
})
</script>
