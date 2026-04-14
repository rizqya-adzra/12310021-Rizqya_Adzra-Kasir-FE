<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  layout: 'guest' | 'cashier'
}>()

const auth = useAuthStore()
const isOpen = ref(false)
const route = useRoute()

const handleLogout = async () => {
  await auth.logout() 
}

watch(() => route.path, () => {
  isOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
    <div class="px-6 h-full flex items-center justify-end">
      
      <div class="flex items-center gap-8">
        <nav class="hidden lg:flex items-center gap-2">
          
          <template v-if="layout === 'cashier'">
            <NuxtLink to="/cashier/dashboard" #default="{ isActive }">
              <NavButton label="Dashboard" :is-active="isActive" />
            </NuxtLink>
            <NuxtLink to="/cashier/product" #default="{ isActive }">
              <NavButton label="Produk" :is-active="isActive" />
            </NuxtLink>
            <NuxtLink to="/cashier/transaction" #default="{ isActive }">
              <NavButton label="Pembelian" :is-active="isActive" />
            </NuxtLink>
            <NavButton @click="handleLogout"  label="logout" :disabled="auth.loading" />
            <NuxtLink to="/cashier/transaction/create">
              <UiButton label="Tambah Pembelian" iconName="i-lucide-plus" class="w-full justify-center" />
            </NuxtLink>
          </template>

          <template v-else-if="layout === 'guest'">
            <NavButton label="About Us" />
            <NavButton label="Terms of Service" />
            <NavButton label="Privacy Policy" />
            <NuxtLink to="/login">
              <UiButton label="Login" />
            </NuxtLink>
          </template>

        </nav>
      </div>

      <div class="lg:hidden flex items-center justify-end w-full">
        <div class="flex items-center gap-5 mr-15 transition-all duration-300" :class="isOpen ? 'opacity-0 translate-x-10' : 'opacity-100'">
        </div>
      </div>

    </div>
  </header>
</template>