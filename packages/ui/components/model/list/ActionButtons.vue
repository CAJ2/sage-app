<template>
  <div class="flex gap-2">
    <button
      v-if="buttons && buttons.includes('select')"
      class="btn btn-square btn-ghost"
      @click.prevent.stop="() => emits('button', 'select')"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="size-[1.2em]" />
    </button>
    <button
      v-if="buttons && buttons.includes('edit')"
      class="btn btn-square btn-ghost"
      @click.prevent.stop="() => emits('button', 'edit')"
    >
      <font-awesome-icon icon="fa-solid fa-pencil" class="size-[1.2em]" />
    </button>
    <button
      v-if="buttons && buttons.includes('delete')"
      class="btn btn-square btn-ghost"
      @click.prevent.stop="() => emits('button', 'delete')"
    >
      <font-awesome-icon icon="fa-solid fa-trash" class="size-[1.2em]" />
    </button>
  </div>
</template>

<script setup lang="ts">
const { buttons } = defineProps<{
  buttons?: ('select' | 'edit' | 'delete')[]
}>()

const emits = defineEmits<{
  (e: 'button', btn: string): void
}>()
</script>
