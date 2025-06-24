<template>
  <Button
    v-for="btn in btns"
    :key="btn.action"
    variant="outline"
    @click="triggerAction(btn.action)"
    ><font-awesome-icon v-if="btn.icon" :icon="btn.icon" />
    {{ btn.text }}
  </Button>
</template>

<script setup lang="ts">
type Btns = {
  action: string
  icon?: string
  text?: string
}[]
const { btns } = defineProps<{
  btns?: Btns
}>()

const emits = defineEmits<{
  (e: 'action', action: string): void
}>()
const triggerAction = (action: string) => {
  emits('action', action)
}
</script>
