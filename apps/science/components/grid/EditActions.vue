<template>
  <Button @click="triggerAction('update')"
    ><font-awesome-icon icon="fa-solid fa-pencil"
  /></Button>
</template>

<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community'

const { params } = defineProps<{
  params: ICellRendererParams
}>()
const triggerAction = (action: string) => {
  type ActionFn = (data: ICellRendererParams['data']) => void
  const actionFns: Record<string, ActionFn> | undefined = (
    params as ICellRendererParams & { actions: Record<string, ActionFn> }
  ).actions
  if (actionFns && actionFns[action]) {
    actionFns[action](params.data)
  }
}
</script>
