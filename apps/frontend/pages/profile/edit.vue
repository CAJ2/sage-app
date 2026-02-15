<template>
  <div>
    <NavTopbar title="Edit Profile" back="true" />
    <div class="flex grow items-center justify-center p-6 lg:p-10">
      <form class="grid w-full max-w-sm grid-cols-1 gap-8" @submit.prevent.stop="form.handleSubmit">
        <div class="mt-4" />
        <div class="" />
        <div>
          <form.Subscribe>
            <template #default="{ canSubmit, isSubmitting }">
              <button type="submit" :disabled="!canSubmit" class="btn btn-block btn-primary">
                {{ isSubmitting ? '...' : 'Save' }}
              </button>
            </template>
          </form.Subscribe>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'

const auth = useAuthClient()
const router = useRouter()

const session = auth.useSession()
if (session.value.data) {
  router.replace('/profile')
}

const form = useForm({
  defaultValues: {},
  validators: {
    onBlur: z.object({
      email: z.string().email(),
      password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    }),
  },
  onSubmit: () => {},
})
</script>
