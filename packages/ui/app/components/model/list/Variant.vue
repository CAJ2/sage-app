<template>
  <li class="list-row relative" :class="{ 'cursor-pointer hover:bg-base-200': !!href }">
    <NuxtLink v-if="href" :to="href" class="absolute inset-0" />
    <div>
      <UiImage class="size-10" :src="variant.imageURL"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ variant.name }}</div>
      <div class="text-xs opacity-70">
        {{ variant.desc }}
      </div>
    </div>
    <ModelListActionButtons
      v-if="buttons && buttons.length"
      :id="variant.id"
      class="relative z-10"
      :buttons="buttons"
      @button="(btn: string) => emits('button', btn, variant.id)"
    />
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListVariantFragment = graphql(`
  fragment ListVariantFragment on Variant {
    id
    name
    desc
    imageURL
  }
`)

const props = defineProps<{
  variant: FragmentType<typeof ListVariantFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
  href?: string
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const variant = computed(() => useFragment(ListVariantFragment, props.variant))
</script>
