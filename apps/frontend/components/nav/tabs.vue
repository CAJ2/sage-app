<template>
  <div
    class="flex justify-around justify-items-center items-center bg-base-200 relative"
  >
    <!-- Left Tabs -->
    <div
      v-for="(tab, index) in leftTabs"
      :key="index"
      class="flex-1 flex justify-center"
    >
      <router-link :to="{ path: tab.path }">
        <button
          class="flex flex-col items-center p-1 cursor-pointer"
          :class="{
            'text-accent': activeTab === tab.path,
            'text-base-content': activeTab !== tab.path,
          }"
        >
          <font-awesome-icon :icon="tab.icon" class="w-6 h-6" />
          <span class="text-sm">{{ tab.label }}</span>
        </button>
      </router-link>
    </div>

    <!-- Center Search Button -->
    <div class="inset-x-0 top-0 -translate-y-1/3 px-3">
      <router-link
        :to="{ path: '/search' }"
        class="flex items-center justify-center"
      >
        <button class="w-16 h-16 btn btn-primary rounded-full p-0">
          <font-awesome-icon
            icon="fa-solid fa-magnifying-glass"
            class="w-8 h-8"
          />
        </button>
      </router-link>
    </div>

    <!-- Right Tabs -->
    <div
      v-for="(tab, index) in rightTabs"
      :key="index"
      class="flex-1 flex justify-center"
    >
      <router-link :to="{ path: tab.path }">
        <button
          class="flex flex-col items-center p-1 cursor-pointer"
          :class="{
            'text-accent': activeTab === tab.path,
            'text-base-content': activeTab !== tab.path,
          }"
        >
          <font-awesome-icon :icon="tab.icon" class="w-6 h-6" />
          <span class="text-sm">{{ tab.label }}</span>
        </button>
      </router-link>
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
