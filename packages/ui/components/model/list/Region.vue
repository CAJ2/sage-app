<template>
  <li class="list-row">
    <div>
      <div class="text-bold">{{ region.name }}</div>
    </div>
    <ModelListActionButtons
      v-if="buttons && buttons.length"
      :id="region.id"
      :buttons="buttons"
      @button="(btn: string) => emits('button', btn, region.id)"
    />
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
