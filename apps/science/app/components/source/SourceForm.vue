<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <div class="flex flex-col gap-1">
      <label class="label">Type</label>
      <select v-model="form.type" class="select-bordered select w-full" required>
        <option v-for="t in sourceTypes" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>
    <div class="flex flex-col gap-1">
      <label class="label">Content URL</label>
      <FormInput v-model="form.contentURL" placeholder="https://..." />
    </div>
    <div class="flex flex-col gap-1">
      <label class="label">Location</label>
      <FormInput v-model="form.location" placeholder="Page number, section, etc." />
    </div>
    <div class="flex flex-col gap-1">
      <label class="label">Metadata (JSON)</label>
      <FormTextArea v-model="form.metadataRaw" placeholder="{}" />
      <span v-if="metadataError" class="text-xs text-error">{{ metadataError }}</span>
    </div>
    <div class="flex flex-col gap-1">
      <label class="label">Content (JSON)</label>
      <FormTextArea v-model="form.contentRaw" placeholder="{}" />
      <span v-if="contentError" class="text-xs text-error">{{ contentError }}</span>
    </div>
    <div class="flex justify-end gap-2">
      <Button type="submit">{{ sourceId ? 'Save' : 'Create' }}</Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'
import { SourceType } from '~/gql/graphql'

const props = defineProps<{
  sourceId?: string
  initialType?: SourceType
  initialContentURL?: string
  initialLocation?: string
  initialMetadata?: Record<string, unknown> | null
  initialContent?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const sourceTypes = Object.values(SourceType)

const form = reactive({
  type: props.initialType ?? SourceType.Url,
  contentURL: props.initialContentURL ?? '',
  location: props.initialLocation ?? '',
  metadataRaw: props.initialMetadata ? JSON.stringify(props.initialMetadata, null, 2) : '',
  contentRaw: props.initialContent ? JSON.stringify(props.initialContent, null, 2) : '',
})

const metadataError = ref('')
const contentError = ref('')

const createSourceMutation = graphql(`
  mutation CreateSourceFromForm($input: CreateSourceInput!) {
    createSource(input: $input) {
      source {
        id
      }
    }
  }
`)

const updateSourceMutation = graphql(`
  mutation UpdateSourceFromForm($input: UpdateSourceInput!) {
    updateSource(input: $input) {
      source {
        id
      }
    }
  }
`)

const { mutate: createSource } = useMutation(createSourceMutation)
const { mutate: updateSource } = useMutation(updateSourceMutation)

const parseJSON = (raw: string, errorRef: Ref<string>): Record<string, unknown> | null => {
  if (!raw.trim()) return null
  try {
    errorRef.value = ''
    return JSON.parse(raw)
  } catch {
    errorRef.value = 'Invalid JSON'
    return undefined as unknown as null
  }
}

const onSubmit = async () => {
  const metadata = parseJSON(form.metadataRaw, metadataError)
  const content = parseJSON(form.contentRaw, contentError)
  if (metadataError.value || contentError.value) return

  if (props.sourceId) {
    await updateSource({
      input: {
        id: props.sourceId,
        type: form.type,
        contentURL: form.contentURL || null,
        location: form.location || null,
        metadata,
        content,
      },
    })
  } else {
    await createSource({
      input: {
        type: form.type,
        contentURL: form.contentURL || null,
        location: form.location || null,
        metadata,
        content,
      },
    })
  }
  emit('saved')
}
</script>
