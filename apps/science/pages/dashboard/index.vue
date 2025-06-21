<template>
  <div :data-ag-theme-mode="isDark ? 'dark' : 'light'">
    <ag-grid-vue
      :row-data="rowData"
      :column-defs="colDefs"
      :default-col-def="{
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
      }"
      style="height: 500px"
    ></ag-grid-vue>
  </div>
</template>

<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { AgGridVue } from 'ag-grid-vue3'
import { graphql } from '~/gql'

const isDark = useDark()

const rowData = ref([
  { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
  { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
  { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
])

const colDefs = ref([
  { field: 'make' },
  { field: 'model' },
  { field: 'price' },
  { field: 'electric' },
])
const _testQuery = graphql(`
  query TestQuery {
    rootCategory {
      id
    }
  }
`)
</script>
