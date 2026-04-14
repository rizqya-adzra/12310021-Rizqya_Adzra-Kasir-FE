<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'guest'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <p class="font-bold text-tertiary text-5xl">Welcome to Cashier Indo<span class="text-gray">Juli!</span></p>
    <p class="font-semibold text-gray mt-3">lorem ipsum dolor sit amet</p>
    <UiButton class="mt-10" variant="primary" label="Get Started" @click="$router.push('/login')" />
  </div>
</template>