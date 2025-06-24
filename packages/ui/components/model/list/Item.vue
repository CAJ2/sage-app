<template>
  <li class="list-row">
    <div>
      <UiImage class="size-10" :src="item.image_url"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ item.name }}</div>
      <div class="text-xs opacity-70">
        {{ item.desc }}
      </div>
    </div>
    <ModelListActionButtons
      v-if="buttons && buttons.length"
      :id="item.id"
      :buttons="buttons"
      @button="(btn: string) => emits('button', btn, item.id)"
    />
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListItemFragment = graphql(`
  fragment ListItemFragment on Item {
    id
    name
    desc
    image_url
  }
`)

const props = defineProps<{
  item: FragmentType<typeof ListItemFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const item = computed(() => useFragment(ListItemFragment, props.item))
</script>
