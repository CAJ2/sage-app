<template>
  <ul class="list">
    <ModelListCategory v-if="type === 'Category' && data" :category="data" />
    <ModelListItem v-if="type === 'Item' && data" :item="data" />
    <ModelListVariant v-if="type === 'Variant' && data" :variant="data" />
    <ModelListComponent v-if="type === 'Component' && data" :component="data" />
    <ModelListOrg v-if="type === 'Org' && data" :org="data" />
    <ModelListRegion v-if="type === 'Region' && data" :region="data" />
    <ModelListPlace v-if="type === 'Place' && data" :place="data" />
    <ModelListMaterial v-if="type === 'Material' && data" :material="data" />
  </ul>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const { type, id } = defineProps<{
  type: string
  id: string
}>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = ref<any>()
if (type === 'Category') {
  const RefCategoryQuery = graphql(`
    query RefCategoryQuery($id: ID!) {
      category(id: $id) {
        ...ListCategoryFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefCategoryQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.category) {
        data.value = result.category
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
} else if (type === 'Item') {
  const RefItemQuery = graphql(`
    query RefItemQuery($id: ID!) {
      item(id: $id) {
        ...ListItemFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefItemQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.item) {
        data.value = result.item
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
} else if (type === 'Variant') {
  const RefVariantQuery = graphql(`
    query RefVariantQuery($id: ID!) {
      variant(id: $id) {
        ...ListVariantFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefVariantQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.variant) {
        data.value = result.variant
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
} else if (type === 'Component') {
  const RefComponentQuery = graphql(`
    query RefComponentQuery($id: ID!) {
      component(id: $id) {
        ...ListComponentFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefComponentQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.component) {
        data.value = result.component
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
} else if (type === 'Org') {
  const RefOrgQuery = graphql(`
    query RefOrgQuery($id: ID!) {
      org(id: $id) {
        ...ListOrgFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefOrgQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.org) {
        data.value = result.org
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
} else if (type === 'Region') {
  const RefRegionQuery = graphql(`
    query RefRegionQuery($id: ID!) {
      region(id: $id) {
        ...ListRegionFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefRegionQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.region) {
        data.value = result.region
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
} else if (type === 'Place') {
  const RefPlaceQuery = graphql(`
    query RefPlaceQuery($id: ID!) {
      place(id: $id) {
        ...ListPlaceFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefPlaceQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.place) {
        data.value = result.place
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
} else if (type === 'Material') {
  const RefMaterialQuery = graphql(`
    query RefMaterialQuery($id: ID!) {
      material(id: $id) {
        ...ListMaterialFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefMaterialQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.material) {
        data.value = result.material
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
}
</script>
