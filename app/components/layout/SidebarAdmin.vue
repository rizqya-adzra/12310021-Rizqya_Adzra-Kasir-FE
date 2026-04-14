<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import defaultProfile from '~/assets/images/default_profile.jpg'
import { useAuthStore } from '~/stores/useAuthStore'

const auth = useAuthStore()

const isOpen = ref(false)
const route = useRoute()
const isProductOpen = ref(true) 

watch(() => route.path, () => {
  isOpen.value = false
})

const handleLogout = async () => {
  await auth.logout() 
}

onMounted(async () => {
  if (!auth.user?.profile) {
    try {
      await auth.fetchProfile()
    } catch (err) {
      console.error("Gagal mengambil data profil:", err)
    }
  }
})
</script>

<template>
  <aside class="hidden lg:flex w-65 h-screen flex-col py-8 px-5 sticky top-0 shrink-0">
    <div class="mb-10 px-2">
      <p class="font-bold text-3xl">IndoJuli</p>
    </div>
    
    <nav class="flex flex-col gap-2 flex-1 w-full overflow-y-auto no-scrollbar">
      <NuxtLink to="/admin/dashboard" #default="{ isActive }">
        <NavIcon 
          label="Dashboard" 
          name="i-lucide-home" 
          :is-active="isActive" 
        />
      </NuxtLink>

      <div>
        <NavIcon 
          label="Produk" 
          name="i-lucide-box" 
          :is-dropdown="true"
          :is-open="isProductOpen"
          @click="isProductOpen = !isProductOpen"
        />
        
        <div v-show="isProductOpen" class="flex flex-col gap-1 mt-1 pl-10 pr-2">
          <NuxtLink to="/admin/product/list-page" #default="{ isActive }">
            <NavIcon label="List Produk" :is-active="isActive" />
          </NuxtLink>
          <NuxtLink to="/admin/category/list-page" #default="{ isActive }">
            <NavIcon label="Kategori" :is-active="isActive" />
          </NuxtLink>
        </div>
      </div>

      <NuxtLink to="/admin/transaction/list-page" #default="{ isActive }">
        <NavIcon 
          label="Transaksi" 
          name="i-lucide-file-text" 
          :is-active="isActive" 
        />
      </NuxtLink>
      <NuxtLink to="/admin/user/list-page" #default="{ isActive }">
        <NavIcon 
          label="User" 
          name="i-lucide-users" 
          :is-active="isActive" 
        />
      </NuxtLink>
      <button 
        @click="handleLogout" 
        class="w-full text-left cursor-pointer appearance-none bg-transparent border-none p-0 m-0"
        :disabled="auth.loading"
      >
        <NavIcon 
          label="Logout" 
          name="i-lucide-log-out" 
          :is-active="false" 
        />
      </button>
    </nav>

    <div class="mt-auto shrink-0 pt-4 border-t border-gray-100">
      <div class="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
        <img :src="auth?.user?.image || defaultProfile" alt="Profile" class="object-cover rounded-full w-12 h-12" />  
        <div class="flex flex-col overflow-hidden">
          <span class="text-sm font-bold text-black truncate">{{ auth?.user?.username || '-' }}</span>
          <span class="text-xs text-gray truncate">{{ auth?.user?.email || '-' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>