<template>
  <li class="list-row">
    <div>
      <UiImage class="size-10" :src="variant.image_url"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ variant.name }}</div>
      <div class="text-xs opacity-70">
        {{ variant.desc }}
      </div>
    </div>
    <button
      v-if="buttons && buttons.includes('select')"
      class="btn btn-square btn-ghost"
      @click.prevent.stop="() => emits('button', 'select', variant.id)"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="size-[1.2em]" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListVariantFragment = graphql(`
  fragment ListVariantFragment on Variant {
    id
    name
    desc
    image_url
  }
`)

const props = defineProps<{
  variant: FragmentType<typeof ListVariantFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const variant = computed(() => useFragment(ListVariantFragment, props.variant))
</script>
