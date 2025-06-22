<template>
  <li class="list-row">
    <div>
      <UiImage class="size-10" :src="component.image_url"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ component.name }}</div>
      <div class="text-xs opacity-70">
        {{ component.desc }}
      </div>
    </div>
    <button
      v-if="buttons && buttons.includes('select')"
      class="btn btn-square btn-ghost"
      @click.prevent.stop="() => emits('button', 'select', component.id)"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="size-[1.2em]" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListComponentFragment = graphql(`
  fragment ListComponentFragment on Component {
    id
    name
    desc
    image_url
  }
`)

const props = defineProps<{
  component: FragmentType<typeof ListComponentFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const component = computed(() =>
  useFragment(ListComponentFragment, props.component),
)
</script>
