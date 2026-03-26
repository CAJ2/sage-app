<template>
  <div>
    <div class="grid grid-cols-4 md:grid-cols-12">
      <div class="col-span-4 bg-base-200 p-5 md:col-span-6 md:col-start-4">
        <div v-if="session.data" class="flex justify-between">
          <div class="flex-1">
            <p><strong>Name:</strong> {{ session.data.user.name }}</p>
            <p><strong>Email:</strong> {{ session.data.user.email }}</p>
          </div>
          <button class="btn btn-circle btn-ghost" @click="signOut">
            <LogOutIcon class="size-5" />
          </button>
        </div>
        <div v-if="session.isPending" class="flex w-52 flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 shrink-0 skeleton rounded-full" />
            <div class="flex flex-col gap-4">
              <div class="h-6 w-20 skeleton" />
              <div class="h-6 w-28 skeleton" />
            </div>
          </div>
          <div class="h-18 w-full skeleton" />
        </div>
        <div v-if="!session.data && !session.isPending">
          <h1 class="py-3 text-2xl">Sign in to your Account</h1>
          <p class="py-3">Contribute to the project and save your settings.</p>
          <button class="btn btn-block btn-primary">
            <NuxtLinkLocale to="/profile/sign_in">Sign in with Email</NuxtLinkLocale>
          </button>
        </div>
      </div>
      <div class="col-span-4 flex flex-col gap-3 px-4 py-3 md:col-span-6 md:col-start-4">
        <!-- Region -->
        <NuxtLinkLocale to="/profile/region">
          <Card class="bg-base-200">
            <CardContent
              class="flex items-center gap-4 px-5 py-4 transition-colors active:bg-base-300"
            >
              <div class="text-accent">
                <MapIcon class="size-5" />
              </div>
              <div class="flex flex-1 flex-col">
                <h2 class="font-medium">Region</h2>
                <p class="text-xs opacity-60">{{ regionData?.region.name || '' }}</p>
              </div>
              <ChevronRightIcon class="size-4 opacity-40" />
            </CardContent>
          </Card>
        </NuxtLinkLocale>

        <!-- Edit Profile (auth-gated) -->
        <NuxtLinkLocale v-if="session.data" to="/profile/edit">
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
        </NuxtLinkLocale>

        <!-- App Settings -->
        <NuxtLinkLocale to="/profile/settings">
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
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthClient } from '~/utils'
import {
  ChevronRight as ChevronRightIcon,
  LogOutIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  UserIcon,
} from 'lucide-vue-next'

const auth = useAuthClient()
const session = auth.useSession()
const region = useRegionStore()
await region.load()

const signOut = async () => {
  await auth.signOut()
}

const regionQuery = gql`
  query RegionQuery($id: ID!) {
    region(id: $id) {
      id
      name
      placetype
    }
  }
`
type RegionResult = {
  region: {
    id: string
    name?: string
    placetype: string
  }
}
const { data: regionData } = await useAsyncQuery<RegionResult>(regionQuery, {
  id: region.selectedRegion,
})
</script>
