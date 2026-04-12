<template>
  <div>
    <SidebarProvider v-model:open="sidebarOpen">
      <Sidebar>
        <SidebarHeader>
          <div class="flex items-center">
            <NuxtLink :to="'/'">
              <div class="p-3"><img src="/favicon-32x32.png" /></div>
            </NuxtLink>
            <div class="text-bold grow px-2 text-lg text-base-content">Sage</div>
            <SidebarTrigger v-if="sidebarOpen" class="self-start text-base-content/70" />
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
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="item in menuItems" :key="item.url">
                  <SidebarMenuButton
                    as-child
                    class="h-12 px-4 hover:bg-primary/30 hover:text-primary"
                    :class="{
                      'text-primary dark:text-accent': activeTab === item.url,
                    }"
                  >
                    <NuxtLink :to="item.url" class="flex content-center items-center">
                      <component :is="item.icon" class="size-5 shrink-0" />
                      <span class="pl-2">{{ item.title }}</span>
                    </NuxtLink>
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
                        <span v-if="!session?.data?.user.image" class="text-neutral-400">
                          <User :size="24" />
                        </span>
                        <img v-if="session?.data?.user.image" :src="session.data.user.image" />
                      </div>
                    </div>
                    {{ session?.data?.user.name || 'Sign in' }}
                    <ChevronsUpDown v-if="session?.data?.user" class="mr-1 ml-auto" :size="20" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent v-if="session?.data?.user" side="top" class="w-48">
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
        <div class="flex h-12 w-full items-center">
          <SidebarTrigger v-if="!sidebarOpen" class="ml-2 text-neutral-400" />
          <SearchDialog />
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
import {
  Blocks,
  Building2,
  ChevronsUpDown,
  Database,
  GitMerge,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  MapPin,
  Shapes,
  User,
  Workflow,
} from '@lucide/vue'
import { useTranslate } from '@tolgee/vue'

const sidebarOpen = ref(true)
const showSignIn = useShowSignIn()

const { t } = useTranslate()

const menuItems = computed(() => [
  { title: t.value('nav.dashboard', { ns: 'science' }), url: '/dashboard', icon: LayoutDashboard },
  { title: t.value('nav.categories', { ns: 'science' }), url: '/categories', icon: Shapes },
  { title: t.value('nav.items', { ns: 'science' }), url: '/items', icon: List },
  { title: t.value('nav.variants', { ns: 'science' }), url: '/variants', icon: LayoutGrid },
  { title: t.value('nav.components', { ns: 'science' }), url: '/components', icon: Blocks },
  { title: t.value('nav.materials', { ns: 'science' }), url: '/materials', icon: Layers },
  { title: t.value('nav.processes', { ns: 'science' }), url: '/processes', icon: Workflow },
  { title: t.value('nav.sources', { ns: 'science' }), url: '/sources', icon: Database },
  { title: t.value('nav.orgs', { ns: 'science' }), url: '/orgs', icon: Building2 },
  { title: t.value('nav.places', { ns: 'science' }), url: '/places', icon: MapPin },
  { title: t.value('nav.changes', { ns: 'science' }), url: '/changes', icon: GitMerge },
])

const router = useRouter()
const { client: auth, sessionData: session } = useAuth()
const route = useRoute()
const activeTab = computed(() => {
  const currentPath = route.path
  const currentTab = menuItems.value.find((tab) => {
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
