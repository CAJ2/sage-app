<template>
  <li class="list-row relative" :class="{ 'cursor-pointer hover:bg-base-200': !!href }">
    <NuxtLink v-if="href" :to="href" class="absolute inset-0" />
    <div>
      <div class="text-bold">{{ place.name }}</div>
      <div class="text-xs opacity-70">
        {{ place.desc }}
      </div>
    </div>
    <ModelListActionButtons
      v-if="buttons && buttons.length"
      :id="place.id"
      class="relative z-10"
      :buttons="buttons"
      @button="(btn: string) => emits('button', btn, place.id)"
    />
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListPlaceFragment = graphql(`
  fragment ListPlaceFragment on Place {
    id
    name
    desc
  }
`)

const props = defineProps<{
  place: FragmentType<typeof ListPlaceFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
  href?: string
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const place = computed(() => useFragment(ListPlaceFragment, props.place))
</script>
