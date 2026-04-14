<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/api/useAuth'

definePageMeta({
  middleware: 'auth',
})

const { authStore, router} = useAuth()

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password
    })

    router.push('/') 
    console.log('Login sukses!')

  } catch (error) {
    console.error('Login gagal', error)
  }
}

useHead({
  title: 'Login | Cashier App',
})
</script>

<template>
    <div class="flex min-h-screen justify-center items-center gap-20 bg-neutral px-20 md:px-16 lg:px-32 xl:px-44">
        <div class="bg-white rounded-3xl p-16 w-full max-w-180 space-y-8">
            <div>
                <p class="font-bold text-3xl">Login ke IndoJuli</p>
                <div class="border-2 border-primary rounded-full w-25 mt-3"></div>
            </div>
            <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
                <div class="space-y-3">
                    <UiInput v-model="form.email" label="Email" placeholder="Masukan Email disini" :error="authStore.validationErrors?.email || authStore.validationErrors?.detail || ''" />
                    <UiInput v-model="form.password" label="Password" type="password" placeholder="Masukan Password disini" :error="authStore.validationErrors?.pasword || authStore.validationErrors?.detail || ''" />
                </div>
                <UiButton type="submit" :disabled="authStore.loading" label="Login" class="w-full mt-6" variant="big" />
            </form>
        </div>
    </div>
</template>