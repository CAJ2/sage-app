<template>
  <div :class="styles.arrayList.item">
    <div :class="toolbarClasses"></div>
    <div class="flex items-center">
      <div class="grow">
        <slot></slot>
      </div>
      <button
        :disabled="!deleteEnabled"
        :class="styles.arrayList.itemDelete"
        type="button"
        @click="deleteClicked"
      >
        🗙
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import type { Styles } from '../styles'
import { classes } from '../styles'

const listItem = defineComponent({
  name: 'ArrayListRefElement',
  props: {
    label: {
      required: false,
      type: String,
      default: '',
    },
    deleteEnabled: {
      required: false,
      type: Boolean,
      default: true,
    },
    delete: {
      required: false,
      type: Function,
      default: undefined,
    },
    styles: {
      required: true,
      type: Object as PropType<Styles>,
    },
  },
  computed: {
    contentClasses(): string {
      return classes`${this.styles.arrayList.itemContent} ${
        this.styles.arrayList.itemExpanded
      }`
    },
    toolbarClasses(): string {
      return classes`${this.styles.arrayList.itemToolbar} ${
        this.styles.arrayList.itemExpanded
      }`
    },
  },
  methods: {
    deleteClicked(event: Event): void {
      event.stopPropagation()
      this.delete?.()
    },
  },
})

export default listItem
</script>
