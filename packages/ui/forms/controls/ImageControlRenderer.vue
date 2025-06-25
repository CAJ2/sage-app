<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :is-focused="isFocused"
    :applied-options="appliedOptions"
  >
    <div class="flex gap-2 w-full items-center">
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button variant="outline" :disabled="!control.enabled">
            {{ control.data ? 'Change' : 'Search' }}
          </Button>
        </DialogTrigger>
        <DialogContent class="max-h-[70vh] overflow-auto">
          <DialogTitle> Upload an image or select an icon </DialogTitle>
          <DialogDescription></DialogDescription>
          <Tabs class="w-full" default-value="image">
            <TabsList
              aria-label="Manage your account"
              class="grid w-full grid-cols-2"
            >
              <TabsTrigger value="image"> Image </TabsTrigger>
              <TabsTrigger value="icon"> Icon </TabsTrigger>
            </TabsList>
            <TabsContent value="image" class="flex justify-center my-3">
              <input
                :id="control.id + '-input'"
                type="file"
                class="file-input file-input-md"
                :disabled="!control.enabled"
                :autofocus="appliedOptions.focus"
                :placeholder="appliedOptions.placeholder"
                @change="onChange"
                @focus="isFocused = true"
                @blur="isFocused = false"
              />
            </TabsContent>
            <TabsContent value="icon" class="mx-3">
              <FormInput
                v-model:model-value="iconSearchInput"
                class="w-full"
                placeholder="Search for an icon"
              />
              <ul class="list">
                <li v-for="icon in iconResult?.icons || []" :key="icon">
                  <div
                    class="flex items-center gap-2 cursor-pointer"
                    @click="onIconSelect(icon)"
                  >
                    <UiImage
                      :icon="'iconify://' + icon"
                      class="w-6 h-6"
                      :alt="icon"
                    />
                  </div>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <div v-if="control.data">
        <UiImage
          :src="control.data"
          :alt="control.label"
          class="w-16 h-16 object-cover"
        />
      </div>
    </div>
  </control-wrapper>
</template>

<script lang="ts">
import type {
  ControlElement,
  JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'
import {
  rankWith,
  and,
  uiTypeIs,
  or,
  formatIs,
  optionIs,
} from '@jsonforms/core'
import { defineComponent } from 'vue'
import type { RendererProps } from '@jsonforms/vue'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
// eslint-disable-next-line import/no-named-default
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useVanillaControl } from '../util'
import { watchDebounced } from '@vueuse/core'

const controlRenderer = defineComponent({
  name: 'DatetimeControlRenderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsControl(props)
    const dialogOpen = ref<boolean>(false)
    const iconSearchInput = ref<string>('')
    const iconResult = ref<{ icons: string[] } | null>(null)
    watchDebounced(
      iconSearchInput,
      async (newValue) => {
        if (newValue) {
          // iconResult.value = await $fetch(`/api/search`, {
          //   method: 'GET',
          //   query: { search: newValue, limit: 32 },
          // })
          iconResult.value = { icons: [] }
        }
      },
      {
        debounce: 800,
      },
    )
    const onIconSelect = (icon: string) => {
      input.handleChange(input.control.value.path, `iconify://${icon}`)
      dialogOpen.value = false
    }
    return useVanillaControl(
      { ...input, dialogOpen, iconSearchInput, iconResult, onIconSelect },
      (target) => target.value,
    )
  },
  computed: {
    dataTime(): string {
      return (this.control.data ?? '').substr(0, 16)
    },
  },
})

export default controlRenderer

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(
    2,
    and(uiTypeIs('Control'), or(formatIs('uri'), optionIs('format', 'uri'))),
  ),
}
</script>
