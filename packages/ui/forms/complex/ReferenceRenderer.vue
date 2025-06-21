<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :is-focused="isFocused"
    :applied-options="appliedOptions"
    :label="refType"
  >
    <div class="flex gap-2 w-full items-center">
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button variant="outline" :disabled="!control.enabled">
            {{ selectedId ? 'Change' : 'Search' }}
          </Button>
        </DialogTrigger>
        <DialogContent class="max-h-[70vh] overflow-auto">
          <DialogTitle>
            {{ refType }}
          </DialogTitle>
          <DialogDescription>
            Search for a {{ refType }} to link
          </DialogDescription>
          <p>{{ control.description }}</p>
          <FormInput
            :id="control.id + '-input'"
            v-model:model-value="searchInput"
            class="w-full"
            :class="styles.control.input"
            :disabled="!control.enabled"
            :autofocus="appliedOptions.focus"
            placeholder="Search..."
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
          <ul class="list bg-base-100 rounded-box shadow-md mt-4 mb-6">
            <li class="px-4 py-2 text-xs opacity-60 tracking-wide">
              Search Results ({{ searchData?.search.totalCount || 0 }})
            </li>
            <li v-if="searchLoading" class="list-row flex flex-col">
              <div v-for="i in 3" :key="i" class="flex gap-2">
                <div class="skeleton h-8 w-8 p-4"></div>
                <div class="flex flex-col grow gap-2">
                  <div class="skeleton h-4 w-48"></div>
                  <div class="skeleton h-4 w-24"></div>
                </div>
              </div>
            </li>

            <div
              v-if="searchData?.search.nodes && !searchLoading"
              class="divide-y border-neutral-200"
            >
              <div v-if="searchData.search.nodes[0].__typename === 'Category'">
                <ModelListCategory
                  v-for="(category, i) in searchData.search.nodes"
                  :key="i"
                  :category="category as any"
                  :buttons="['select']"
                  @button="selected"
                />
              </div>
            </div>

            <li
              v-if="
                searchData?.search.nodes &&
                searchData?.search.nodes.length === 0 &&
                searchInput.length > 0
              "
              class="list-row"
            >
              No results found for "{{ searchInput }}"
            </li>
            <li
              v-if="!searchData && searchInput.length === 0"
              class="list-row flex items-center justify-center"
            >
              <div class="text-neutral-500">Search for a {{ refType }}</div>
            </li>
          </ul>
        </DialogContent>
      </Dialog>
      <div v-if="selectedId" class="grow">
        <ModelRef v-if="refType" :id="selectedId" :type="refType" />
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
  schemaMatches,
  schemaTypeIs,
} from '@jsonforms/core'
import { defineComponent } from 'vue'
import type { RendererProps } from '@jsonforms/vue'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { ControlWrapper } from '../controls'
import { useVanillaControl } from '../util'
import { graphql } from '~/gql'
import { watchDebounced } from '@vueuse/core'
import { SearchType } from '~/gql/graphql'

const controlRenderer = defineComponent({
  name: 'ReferenceRenderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsControl(props)
    const refType = (input.control.value.schema as { $id?: string }).$id
    if (!refType) {
      throw new Error('Reference type is not defined in the schema')
    }
    const filterTypes: Record<string, SearchType> = {
      Category: SearchType.Category,
    }
    const searchQuery = graphql(`
      query RefSearchQuery($input: String!, $type: SearchType!) {
        search(query: $input, types: [$type]) {
          totalCount
          nodes {
            ...ListCategoryFragment
          }
        }
      }
    `)
    const dialogOpen = ref<boolean>(false)
    const searchInput = ref<string>('')
    const {
      result: searchData,
      loading: searchLoading,
      load,
      refetch,
    } = useLazyQuery(searchQuery, {
      input: searchInput.value,
      type: filterTypes[refType],
    })
    watchDebounced(
      searchInput,
      async (newValue) => {
        if (newValue.length > 0) {
          if (!searchData.value) {
            await load(searchQuery, {
              input: newValue,
              type: filterTypes[refType],
            })
          } else {
            await refetch({ input: newValue, type: filterTypes[refType] })
          }
        }
      },
      { debounce: 300, immediate: true },
    )
    const selectedId = computed(() => {
      return input.control.value.data || ''
    })
    const selected = (btn: string, id: string) => {
      if (btn === 'select') {
        input.handleChange(input.control.value.path, id)
        dialogOpen.value = false
      }
    }

    return useVanillaControl(
      {
        ...input,
        refType,
        dialogOpen,
        searchData,
        searchLoading,
        searchInput,
        selected,
        selectedId,
      },
      (target) => target.value || undefined,
    )
  },
})

export default controlRenderer

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(
    2,
    and(
      uiTypeIs('Control'),
      schemaMatches((schema) => {
        const sch = schema as { $id: string }
        return (
          Object.prototype.hasOwnProperty.call(schema, '$id') &&
          ['Category'].includes(sch.$id)
        )
      }),
      schemaTypeIs('string'),
    ),
  ),
}
</script>
