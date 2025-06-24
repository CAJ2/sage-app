<template>
  <li class="list-row">
    <div>
      <UiImage class="size-10" :src="org.avatar_url"></UiImage>
    </div>
    <div>
      <div class="text-bold">{{ org.name_req }}</div>
      <div class="text-xs opacity-70">
        {{ org.desc }}
      </div>
    </div>
    <ModelListActionButtons
      v-if="buttons && buttons.length"
      :id="org.id"
      :buttons="buttons"
      @button="(btn: string) => emits('button', btn, org.id)"
    />
  </li>
</template>

<script setup lang="ts">
import { graphql, useFragment, type FragmentType } from '~/gql'

const ListOrgFragment = graphql(`
  fragment ListOrgFragment on Org {
    id
    name_req: name
    desc
    avatar_url
  }
`)

const props = defineProps<{
  org: FragmentType<typeof ListOrgFragment>
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string, id: string): void
}>()

const org = computed(() => useFragment(ListOrgFragment, props.org))
</script>
