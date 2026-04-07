<template>
  <div>
    <div class="flex items-start gap-3 p-3">
      <Button variant="ghost" @click="navigateTo('/materials')">
        <ArrowLeft class="size-4" />
        <T ns="science" key-name="materials.title" default-value="Materials" />
      </Button>
      <div class="flex-1">
        <h1 class="text-xl font-bold">{{ entity?.name ?? id }}</h1>
        <EntityMeta
          v-if="entity"
          :id="entity.id"
          :created-at="entity.createdAt"
          :updated-at="entity.updatedAt"
        />
      </div>
    </div>

    <div v-if="entity">
      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <table class="table w-full">
            <tbody>
              <tr>
                <td class="font-semibold">Name</td>
                <td>{{ entity.name }}</td>
              </tr>
              <tr v-if="entity.desc">
                <td class="font-semibold">Description</td>
                <td>{{ entity.desc }}</td>
              </tr>
              <tr v-if="entity.shape">
                <td class="font-semibold">Shape</td>
                <td>{{ entity.shape }}</td>
              </tr>
              <tr>
                <td class="font-semibold">Technical</td>
                <td>{{ entity.technical ? 'Yes' : 'No' }}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Parent Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list">
            <li v-for="parent in entity.parents?.nodes ?? []" :key="parent.id">
              <NuxtLink :to="`/materials/${parent.id}`" class="list-row hover:bg-base-200">
                <div class="text-sm">{{ parent.name ?? parent.id }}</div>
              </NuxtLink>
            </li>
          </ul>
          <div v-if="!entity.parents?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>

      <Card class="m-3 border-0 bg-base-100 shadow-md">
        <CardHeader>
          <CardTitle>Child Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="list">
            <li v-for="child in entity.children?.nodes ?? []" :key="child.id">
              <NuxtLink :to="`/materials/${child.id}`" class="list-row hover:bg-base-200">
                <div class="text-sm">{{ child.name ?? child.id }}</div>
              </NuxtLink>
            </li>
          </ul>
          <div v-if="!entity.children?.nodes?.length" class="text-sm opacity-60">None</div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="flex justify-center p-8">
      <span class="loading loading-lg loading-spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

import { graphql } from '~/gql'

const route = useRoute()
const id = computed(() => route.params.id as string)

const detailQuery = graphql(`
  query MaterialDetail($id: ID!) {
    material(id: $id) {
      id
      name
      desc
      shape
      technical
      createdAt
      updatedAt
      parents(first: 20) {
        nodes {
          id
          name
        }
      }
      children(first: 50) {
        nodes {
          id
          name
        }
      }
    }
  }
`)

const { result } = useQuery(detailQuery, () => ({ id: id.value }))
const entity = computed(() => result.value?.material)
</script>
