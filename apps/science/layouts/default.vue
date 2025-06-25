<template>
  <div>
    <SidebarProvider v-model:open="sidebarOpen">
      <Sidebar>
        <SidebarHeader>
          <div class="flex items-center">
            <NuxtLinkLocale :to="'/'">
              <div class="p-3"><img src="/favicon-32x32.png" /></div>
            </NuxtLinkLocale>
            <div class="grow px-2 text-lg text-bold text-base-content">
              Sage
            </div>
            <SidebarTrigger
              v-if="sidebarOpen"
              class="self-start text-base-content/70"
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton as-child class="h-12 px-4">
                    <SidebarChangeSelector />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="item in menuItems" :key="item.title">
                  <SidebarMenuButton
                    as-child
                    class="h-12 px-4 hover:bg-primary/30 hover:text-primary"
                    :class="{
                      'text-primary dark:text-accent': activeTab === item.url,
                    }"
                  >
                    <NuxtLinkLocale
                      :to="item.url"
                      class="flex content-center items-center"
                    >
                      <UiImage
                        :src="item.icon"
                        :width="6"
                        :height="6"
                        class="p-0"
                      />
                      <span class="pl-2">{{ item.title }}</span>
                    </NuxtLinkLocale>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <SidebarMenuButton
                    class="h-16"
                    @click="!session?.data?.user && (showSignIn = true)"
                  >
                    <div
                      class="avatar px-2"
                      :class="{
                        'avatar-placeholder': !session?.data?.user?.image,
                      }"
                    >
                      <div class="w-8 rounded-full">
                        <span
                          v-if="!session?.data?.user.image"
                          class="text-neutral-400"
                          ><svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"
                            />
                          </svg>
                        </span>
                        <img
                          v-if="session?.data?.user.image"
                          :src="session.data.user.image"
                        />
                      </div>
                    </div>
                    {{ session?.data?.user.name || 'Sign in' }}
                    <svg
                      v-if="session?.data?.user"
                      class="ml-auto mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-dasharray="12"
                        stroke-dashoffset="12"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8l-7 7M12 8l7 7"
                      >
                        <animate
                          fill="freeze"
                          attributeName="stroke-dashoffset"
                          dur="0.3s"
                          values="12;0"
                        />
                      </path>
                    </svg>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  v-if="session?.data?.user"
                  side="top"
                  class="w-48"
                >
                  <DropdownMenuItem @click="signOut">
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main class="flex w-full flex-col bg-base-200">
        <div class="flex w-full h-12 items-center">
          <SidebarTrigger v-if="!sidebarOpen" class="ml-2 text-neutral-400" />
          <Dialog>
            <DialogTrigger as-child>
              <Button
                class="btn mx-3 w-48 bg-zinc-600/30 hover:bg-zinc-300/50 justify-start"
                variant="ghost"
              >
                Search...
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[475px] p-0">
              <div
                class="flex h-full w-full flex-col overflow-hidden rounded-md bg-base-200"
              >
                <div class="flex items-center border-b px-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path d="m21 21l-4.34-4.34" />
                      <circle cx="11" cy="11" r="8" />
                    </g>
                  </svg>
                  <FormInput
                    id="search"
                    class="flex h-10 w-full rounded-md bg-transparent my-1 py-3 text-md outline-none border-0 focus:border-0"
                  />
                </div>
                <div
                  class="max-h-[300px] overflow-y-auto overflow-x-hidden"
                  role="listbox"
                ></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <slot />
      </main>
    </SidebarProvider>
    <Dialog v-model:open="showSignIn">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader class="flex items-center">
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription> Sign in to your account </DialogDescription>
        </DialogHeader>
        <div class="grid w-full max-w-sm grid-cols-1 gap-8">
          <AuthSignIn @sign-in="signIn" />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
const showSignIn = ref(false)

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: 'iconify://mdi:home' },
  {
    title: 'Categories',
    url: '/categories',
    icon: 'iconify://material-symbols:category',
  },
  {
    title: 'Items',
    url: '/items',
    icon: 'iconify://material-symbols:list-rounded',
  },
  {
    title: 'Variants',
    url: '/variants',
    icon: 'iconify://qlementine-icons:items-grid-16',
  },
  {
    title: 'Components',
    url: '/components',
    icon: 'iconify://uiw:component',
  },
  {
    title: 'Processes',
    url: '/processes',
    icon: 'iconify://clarity:process-on-vm-line',
  },
  {
    title: 'Sources',
    url: '/sources',
    icon: 'iconify://ic:outline-source',
  },
]

const router = useRouter()
const auth = useAuthClient()
const session = useAuthSession()
const route = useRoute()
const localePath = useLocalePath()

const activeTab = computed(() => {
  const currentPath = localePath(route.path, 'en')
  const currentTab = menuItems.find((tab) => {
    return currentPath.startsWith(tab.url)
  })
  return currentTab ? currentTab.url : null
})

const signIn = async () => {
  session.value = await auth.getSession()
  if (session.value.data) {
    showSignIn.value = false
  }
}

const signOut = async () => {
  await auth.signOut().then(() => {
    router.push('/')
  })
}
</script>
