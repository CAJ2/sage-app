<template>
  <form
    class="grid mx-3 grid-cols-1 gap-8"
    @submit.prevent.stop="form.handleSubmit"
  >
    <div class="mt-4">
      <form.Field name="title">
        <template #default="{ field }">
          <FormLabel :for="field.name" class="text-md my-3">Title</FormLabel>
          <FormInput
            :id="field.name"
            :name="field.name"
            :value="field.state.value"
            class="mt-4"
            :validators="{
              onBlur: z.string().min(2).max(100),
            }"
            @blur="field.handleBlur"
            @input="
              (e: any) =>
                field.handleChange((e.target as HTMLInputElement).value)
            "
          />
          <Alert v-if="!field.state.meta.isValid" variant="error" class="mt-4">
            <AlertDescription>{{
              field.state.meta.errors.map((e) => e).join(', ')
            }}</AlertDescription>
          </Alert>
        </template>
      </form.Field>
    </div>
    <div class="">
      <form.Field name="description">
        <template #default="{ field }">
          <FormLabel :for="field.name" class="text-md my-3"
            >Description</FormLabel
          >
          <FormTextArea
            :id="field.name"
            :name="field.name"
            :value="field.state.value"
            class="mt-4"
            :validators="{
              onBlur: z.string().min(2).max(2000),
            }"
            @blur="field.handleBlur"
            @input="
              (e: any) =>
                field.handleChange((e.target as HTMLTextAreaElement).value)
            "
          />
          <Alert v-if="!field.state.meta.isValid" variant="error" class="mt-4">
            <AlertDescription>{{
              field.state.meta.errors.map((e) => e).join(', ')
            }}</AlertDescription>
          </Alert>
        </template>
      </form.Field>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { watchDebounced } from '@vueuse/core'
import { z } from 'zod'

const { data } = defineProps<{
  data: {
    title: string
    description: string
  }
}>()

const emits = defineEmits<{
  (e: 'submit', data: { title: string; description: string }): void
}>()

const form = useForm({
  defaultValues: {
    title: data.title || '',
    description: data.description || '',
  },
  validators: {},
})
const formStore = form.useStore((state) => state.values)
watchDebounced(
  formStore,
  (newValues) => {
    emits('submit', {
      title: newValues.title,
      description: newValues.description,
    })
  },
  { debounce: 1000 },
)
</script>
