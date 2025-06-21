<template>
  <li class="list-row">
    <div>
      <UiImage class="size-10" :src="category.image_url"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ category.name }}</div>
      <div class="text-xs opacity-70">
        {{ category.desc_short }}
      </div>
    </div>
    <button
      v-if="buttons && buttons.includes('select')"
      class="btn btn-square btn-ghost"
      @click.prevent.stop="() => emits('button', 'select', category.id)"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="size-[1.2em]" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListCategoryFragment = graphql(`
  fragment ListCategoryFragment on Category {
    id
    name
    desc_short
    image_url
  }
`)

const props = defineProps<{
  category: FragmentType<typeof ListCategoryFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const category = computed(() =>
  useFragment(ListCategoryFragment, props.category),
)
</script>
