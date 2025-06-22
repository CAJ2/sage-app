<template>
  <li class="list-row">
    <div>
      <div class="text-bold">{{ region.name }}</div>
    </div>
    <button
      v-if="buttons && buttons.includes('select')"
      class="btn btn-square btn-ghost justify-self-end"
      @click.prevent.stop="() => emits('button', 'select', region.id)"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="size-[1.2em]" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListRegionFragment = graphql(`
  fragment ListRegionFragment on Region {
    id
    name
  }
`)

const props = defineProps<{
  region: FragmentType<typeof ListRegionFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const region = computed(() => useFragment(ListRegionFragment, props.region))
</script>
