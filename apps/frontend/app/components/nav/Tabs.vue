<template>
  <div class="relative flex items-center justify-around justify-items-center bg-base-200">
    <!-- Left Tabs -->
    <div class="flex flex-1 justify-center">
      <NuxtLinkLocale :to="{ path: leftTabs['explore'].path }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === leftTabs['explore'].path,
            'text-base-content': activeTab !== leftTabs['explore'].path,
          }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path
              fill="currentColor"
              d="M2 10a8 8 0 1 1 15.994.34a14 14 0 0 0-.994-.233v-.106a6.98 6.98 0 0 0-2.362-5.244l-.069.074c-.201.218-.48.516-.788.836c-.602.626-1.351 1.373-1.855 1.753c.03.066.1.176.242.359l.125.158c.316.397.773.972.958 1.683q.072.277.11.51q-.51.112-.967.286a5 5 0 0 0-.11-.544c-.128-.491-.44-.888-.764-1.3l-.143-.181c-.16-.206-.362-.478-.436-.77a.9.9 0 0 1 .025-.547c.072-.19.203-.336.352-.448c.428-.32 1.127-1.013 1.743-1.652c.302-.314.576-.607.774-.822l.006-.006a6.97 6.97 0 0 0-4.095-1.141c.117.222.252.504.372.823c.281.746.527 1.817.085 2.758c-.404.86-1.097 1.084-1.632 1.222l-.097.025c-.506.13-.755.194-.93.46c-.17.257-.128.574.037 1.113l.039.124c.066.211.143.457.183.688c.05.286.061.636-.113.97a1.67 1.67 0 0 1-.69.724a2.4 2.4 0 0 1-.746.235l-.088.015c-.408.072-.645.113-.867.351c-.178.19-.28.508-.337.941a10 10 0 0 0-.052.534l-.008.095a5 5 0 0 1-.079.605l-.004.02a7 7 0 0 0 3.872 2.17q-.278.444-.514.914A8 8 0 0 1 2 10m6.798-6.646a6 6 0 0 0-.132-.227A7.003 7.003 0 0 0 3.948 13.52q.01-.098.023-.198c.062-.467.193-1.059.597-1.491c.462-.495 1.025-.588 1.403-.65l.108-.019c.203-.036.336-.07.443-.128a.7.7 0 0 0 .281-.309c.029-.054.048-.147.015-.336a4 4 0 0 0-.145-.536L6.625 9.7c-.152-.497-.374-1.262.085-1.958c.4-.607 1.039-.762 1.477-.869l.134-.033c.467-.12.772-.242.977-.68c.261-.556.143-1.292-.116-1.98a6 6 0 0 0-.384-.826m10.127 8.383a.5.5 0 0 0-.425-.237h-.008l-.026-.004l-.091-.017a6 6 0 0 1-.299-.078l-.095-.027a16 16 0 0 0-.841-.218a8.5 8.5 0 0 0-2.952-.152c-1.202.15-2.121.557-2.748 1.142c-.63.588-.94 1.336-.94 2.1q.001.274.038.52c1.05-.917 2.345-1.658 3.776-2.23a.5.5 0 1 1 .372.928a14 14 0 0 0-2.198 1.103c-1.652.964-2.681 2.202-3.435 3.71a.5.5 0 0 0 .894.447c.384-.767.843-1.456 1.448-2.068q.03.056.07.123a4 4 0 0 0 .512.686c.465.501 1.214 1.035 2.273 1.035c.652 0 1.194-.167 1.638-.456c.44-.286.758-.675.996-1.084c.369-.63.579-1.38.735-1.936q.059-.211.109-.377a7.5 7.5 0 0 1 .66-1.483c.118-.207.229-.387.324-.542l.017-.026c.083-.135.167-.27.218-.373a.5.5 0 0 0-.022-.486"
            />
          </svg>
          <span class="text-sm">{{ leftTabs['explore'].label }}</span>
        </button>
      </NuxtLinkLocale>
    </div>
    <div class="flex flex-1 justify-center">
      <NuxtLinkLocale :to="{ path: leftTabs['places'].path }" @dragstart.prevent>
        <button
          class="flex cursor-pointer flex-col items-center p-1"
          :class="{
            'text-accent': activeTab === leftTabs['places'].path,
            'text-base-content': activeTab !== leftTabs['places'].path,
          }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 1 0 3 5 9.71C17 12 17 10 17 9a5 5 0 0 0-5-5"
            />
          </svg>
          <span class="text-sm">{{ leftTabs['places'].label }}</span>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path
              fill="currentColor"
              d="M6.5 9.5a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3a.5.5 0 0 0-1 0v3zM18 10a8 8 0 1 0-16 0l.007.346l.026.382a8 8 0 0 0 .829 2.887l.063.12l-.91 3.644l-.014.083v.082a.5.5 0 0 0 .62.441l3.645-.91l.12.064A8 8 0 0 0 18 10M3 10a7 7 0 1 1 3.577 6.108l-.087-.039l-.091-.021a.5.5 0 0 0-.188.01l-3.024.754l.756-3.02l.014-.095a.5.5 0 0 0-.063-.272A6.97 6.97 0 0 1 3 10"
            />
          </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M6 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6m9-9a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2"
            />
          </svg>
          <span class="text-sm">{{ rightTabs['profile'].label }}</span>
        </button>
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const leftTabs = computed(() => ({
  explore: {
    path: '/explore',
    label: t('tabs.explore'),
    icon: 'fa-regular fa-folder',
  },
  places: {
    path: '/places',
    label: t('tabs.places'),
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 1 0 3 5 9.71C17 12 17 10 17 9a5 5 0 0 0-5-5"/></svg>',
  },
}))
const rightTabs = computed(() => ({
  contribute: {
    path: '/contribute',
    label: t('tabs.contribute'),
    icon: 'fa-solid fa-circle-plus',
  },
  profile: {
    path: '/profile',
    label: t('tabs.profile'),
    icon: 'fa-regular fa-user',
  },
}))

const localePath = useLocalePath()

const activeTab = computed(() => {
  const currentPath = localePath(route.path, 'en')
  const currentTab = [
    leftTabs.value['explore'],
    leftTabs.value['places'],
    rightTabs.value['contribute'],
    rightTabs.value['profile'],
  ].find((tab) => {
    return currentPath.startsWith(tab.path)
  })
  return currentTab ? currentTab.path : null
})
</script>
