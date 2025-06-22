<template>
  <li class="list-row">
    <div>
      <div class="text-bold">{{ place.name }}</div>
      <div class="text-xs opacity-70">
        {{ place.desc }}
      </div>
    </div>
    <button
      v-if="buttons && buttons.includes('select')"
      class="btn btn-square btn-ghost"
      @click.prevent.stop="() => emits('button', 'select', place.id)"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="size-[1.2em]" />
    </button>
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
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const place = computed(() => useFragment(ListPlaceFragment, props.place))
</script>
