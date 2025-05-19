<template>
  <div>
    <div class="grid grid-cols-4 md:grid-cols-12">
      <div class="p-5 col-span-4 md:col-span-6 md:col-start-4 bg-base-200">
        <div v-if="session.data">
          <p><strong>Name:</strong> {{ session.data.user.name }}</p>
          <p><strong>Email:</strong> {{ session.data.user.email }}</p>
        </div>
        <div v-if="session.isPending" class="flex w-52 flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="skeleton h-16 w-16 shrink-0 rounded-full"></div>
            <div class="flex flex-col gap-4">
              <div class="skeleton h-4 w-20"></div>
              <div class="skeleton h-4 w-28"></div>
            </div>
          </div>
          <div class="skeleton h-32 w-full"></div>
        </div>
        <div v-if="!session.data && !session.isPending">
          <h1 class="text-2xl py-3">Sign in to your Account</h1>
          <p class="py-3">Contribute to the project and save your settings.</p>
          <button class="btn btn-primary btn-block">
            <NuxtLink to="/profile/sign_in">Sign in with Email</NuxtLink>
          </button>
        </div>
      </div>
      <div class="col-span-4 md:col-span-6 md:col-start-4 py-3">
        <ul>
          <li class="p-4 flex gap-2">
            <div class="flex-none px-3">
              <font-awesome-icon icon="fa-solid fa-user" />
            </div>
            <div class="flex-1">
              <NuxtLink to="/profile/edit">Edit Profile</NuxtLink>
            </div>
          </li>
          <div class="divider m-1"></div>
          <li class="p-4 flex align-center">
            <div class="flex-none px-3">
              <font-awesome-icon icon="fa-solid fa-circle-half-stroke" />
            </div>
            <div class="flex-1">
              <h2 class="px-2">Dark Mode</h2>
            </div>
            <div class="flex-none mx-2">
              <SwitchRoot
                id="dark-mode"
                v-model="isDark"
                class="w-[40px] h-[24px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-stone-800 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 border border-stone-300 data-[state=checked]:border-stone-700 dark:border-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800"
                @click="toggleDark()"
              >
                <SwitchThumb
                  class="w-4 h-4 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
                />
              </SwitchRoot>
            </div>
          </li>
          <div class="divider m-1"></div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthClient } from '~/utils'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)

const auth = useAuthClient()
const session = auth.useSession()
</script>
