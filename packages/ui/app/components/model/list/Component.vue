<template>
  <li class="list-row">
    <div>
      <UiImage class="size-10" :src="component.imageURL"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ component.name }}</div>
      <div class="text-xs opacity-70">
        {{ component.desc }}
      </div>
    </div>
    <ModelListActionButtons
      v-if="buttons && buttons.length"
      :id="component.id"
      :buttons="buttons"
      @button="(btn: string) => emits('button', btn, component.id)"
    />
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListComponentFragment = graphql(`
  fragment ListComponentFragment on Component {
    id
    name
    desc
    imageURL
  }
`)

const props = defineProps<{
  component: FragmentType<typeof ListComponentFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const component = computed(() => useFragment(ListComponentFragment, props.component))
</script>
