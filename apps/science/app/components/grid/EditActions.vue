<template>
  <Button v-for="btn in btns" :key="btn.action" variant="outline" @click="triggerAction(btn.action)"
    ><component :is="btn.icon" v-if="btn.icon" />
    {{ btn.text }}
  </Button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

type Btns = {
  action: string
  icon?: Component
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
