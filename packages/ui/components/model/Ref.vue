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
      getCategory(id: $id) {
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
      if (result && result.getCategory) {
        data.value = result.getCategory
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
      getItem(id: $id) {
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
      if (result && result.getItem) {
        data.value = result.getItem
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
      getVariant(id: $id) {
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
      if (result && result.getVariant) {
        data.value = result.getVariant
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
      getComponent(id: $id) {
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
      if (result && result.getComponent) {
        data.value = result.getComponent
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
      getOrg(id: $id) {
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
      if (result && result.getOrg) {
        data.value = result.getOrg
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
      getRegion(id: $id) {
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
      if (result && result.getRegion) {
        data.value = result.getRegion
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
      getPlace(id: $id) {
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
      if (result && result.getPlace) {
        data.value = result.getPlace
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
      getMaterial(id: $id) {
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
      if (result && result.getMaterial) {
        data.value = result.getMaterial
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
