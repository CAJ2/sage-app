<template>
  <div>
    <div class="grid grid-cols-4 md:grid-cols-12">
      <div class="col-span-4 bg-base-200 px-6 pt-10 pb-8 md:col-span-6 md:col-start-4">
        <div class="flex items-center justify-between gap-4">
          <div v-if="sessionData?.data" class="flex-1">
            <h1 class="text-2xl font-bold tracking-tight">
              Hello, {{ sessionData.data.user.name.split(' ')[0] }}
            </h1>
            <p class="text-sm opacity-50">{{ sessionData.data.user.email }}</p>
          </div>
          <div v-else-if="status === 'pending'" class="flex-1">
            <div class="mb-2 h-8 w-48 skeleton" />
            <div class="h-4 w-32 skeleton opacity-50" />
          </div>
          <div v-else class="flex-1">
            <h1 class="text-2xl font-bold tracking-tight">Welcome to Sageleaf</h1>
            <p class="mt-1.5 max-w-xs text-sm leading-relaxed opacity-60">
              Start contributing to the project and customize your local experience.
            </p>
          </div>

          <div v-if="status !== 'pending'" class="-mr-2 shrink-0">
            <NuxtLink v-if="!sessionData?.data" to="/profile/sign_in">
              <button class="btn gap-2 px-3 opacity-30 btn-ghost btn-sm hover:opacity-100">
                <LogInIcon class="size-4" />
                <span class="text-xs font-bold tracking-wide uppercase">Sign In</span>
              </button>
            </NuxtLink>
            <button
              v-else
              class="btn gap-2 px-3 opacity-30 btn-ghost btn-sm hover:opacity-100"
              @click="signOut"
            >
              <LogOutIcon class="size-4" />
              <span class="text-xs font-bold tracking-wide uppercase">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      <div class="col-span-4 flex flex-col gap-3 px-4 py-3 md:col-span-6 md:col-start-4">
        <!-- Region -->
        <NuxtLink to="/profile/region">
          <Card class="bg-base-200">
            <CardContent
              class="flex items-center gap-4 px-5 py-4 transition-colors active:bg-base-300"
            >
              <div class="text-accent">
                <MapIcon class="size-5" />
              </div>
              <div class="flex flex-1 flex-col">
                <span
                  v-if="region.regionName"
                  class="text-[10px] font-bold tracking-widest uppercase opacity-60"
                  >Region</span
                >
                <h2 class="font-medium">{{ region.regionName || 'Set Region' }}</h2>
              </div>
              <ChevronRightIcon class="size-4 opacity-40" />
            </CardContent>
          </Card>
        </NuxtLink>

        <!-- Edit Profile (auth-gated) -->
        <NuxtLink v-if="isAuthenticated" to="/profile/edit">
          <Card class="bg-base-200">
            <CardContent
              class="flex items-center gap-4 px-5 py-4 transition-colors active:bg-base-300"
            >
              <div class="text-accent">
                <UserIcon class="size-5" />
              </div>
              <div class="flex-1 font-medium">Edit Profile</div>
              <ChevronRightIcon class="size-4 opacity-40" />
            </CardContent>
          </Card>
        </NuxtLink>

        <!-- App Settings -->
        <NuxtLink to="/profile/settings">
          <Card class="bg-base-200">
            <CardContent
              class="flex items-center gap-4 px-5 py-4 transition-colors active:bg-base-300"
            >
              <div class="text-accent">
                <SettingsIcon class="size-5" />
              </div>
              <div class="flex-1 font-medium">App Settings</div>
              <ChevronRightIcon class="size-4 opacity-40" />
            </CardContent>
          </Card>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronRight as ChevronRightIcon,
  LogInIcon,
  LogOutIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  UserIcon,
} from '@lucide/vue'

useTopbar(null)

const { client: auth, sessionData, status, isAuthenticated } = useAuth()
const region = useRegionStore()
region.load()

const signOut = async () => {
  await auth.signOut()
}
</script>
