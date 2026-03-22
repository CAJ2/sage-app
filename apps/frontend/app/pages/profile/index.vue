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
              <div class="h-4 w-20 skeleton" />
              <div class="h-4 w-28 skeleton" />
            </div>
          </div>
          <div class="h-32 w-full skeleton" />
        </div>
        <div v-if="!session.data && !session.isPending">
          <h1 class="py-3 text-2xl">Sign in to your Account</h1>
          <p class="py-3">Contribute to the project and save your settings.</p>
          <button class="btn btn-block btn-primary">
            <NuxtLinkLocale to="/profile/sign_in">Sign in with Email</NuxtLinkLocale>
          </button>
        </div>
      </div>
      <div class="col-span-4 flex flex-col gap-3 py-3 md:col-span-6 md:col-start-4">
        <!-- Region card -->
        <NuxtLinkLocale to="/profile/region">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body flex-row items-center gap-3 p-4">
              <div class="text-accent">
                <MapIcon class="size-6" />
              </div>
              <div class="flex flex-1 flex-col">
                <h2 class="font-medium">Region</h2>
                <p class="text-xs opacity-70">{{ regionData?.region.name || '' }}</p>
              </div>
            </div>
          </div>
        </NuxtLinkLocale>

        <!-- Edit Profile card (auth-gated) -->
        <NuxtLinkLocale v-if="session.data" to="/profile/edit">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body flex-row items-center gap-3 p-4">
              <div class="text-accent">
                <UserIcon class="size-6" />
              </div>
              <div class="flex-1 font-medium">Edit Profile</div>
            </div>
          </div>
        </NuxtLinkLocale>

        <!-- App Settings card -->
        <NuxtLinkLocale to="/profile/settings">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body flex-row items-center gap-3 p-4">
              <div class="text-accent">
                <SettingsIcon class="size-6" />
              </div>
              <div class="flex-1 font-medium">App Settings</div>
            </div>
          </div>
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthClient } from '~/utils'
import { LogOutIcon, Map as MapIcon, Settings as SettingsIcon, UserIcon } from 'lucide-vue-next'

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
