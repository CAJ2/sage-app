<template>
  <li class="list-row">
    <div>
      <UiImage class="size-10" :src="'icon://lets-icons:materials'"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ material.name }}</div>
      <div class="text-xs opacity-70">
        {{ material.desc }}
      </div>
    </div>
    <ModelListActionButtons
      v-if="buttons && buttons.length"
      :id="material.id"
      :buttons="buttons"
      @button="(btn: string) => emits('button', btn, material.id)"
    />
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListMaterialFragment = graphql(`
  fragment ListMaterialFragment on Material {
    id
    name
    desc
    shape
  }
`)

const props = defineProps<{
  material: FragmentType<typeof ListMaterialFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const material = computed(() =>
  useFragment(ListMaterialFragment, props.material),
)
</script>
