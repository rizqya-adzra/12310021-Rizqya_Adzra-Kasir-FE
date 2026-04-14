<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUser } from '~/composables/api/useUser'
import { useRoute, useRouter } from 'vue-router'
import defaultImage from '~/assets/images/default_image.jpg'

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { fetchUserDetail, deleteUser } = useUser()

const emailParam = route.params.email as string

const { data: response, pending, error } = await fetchUserDetail(emailParam)

const isLoadingDelete = ref(false)

const isDataFound = computed(() => !!response.value?.data)

const formattedDate = computed(() => {
  if (!response.value?.data?.created_at) return '-'
  return new Date(response.value.data.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const goToEdit = (email: string) => {
  router.push(`/admin/user/${email}/edit`)
}

const goBack = () => {
  router.push('/admin/user/list-page') 
}

const onDelete = async (email: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
    try {
      isLoadingDelete.value = true
      await deleteUser(email)
      router.push('/admin/user/list-page')
    } catch (error) {
      alert('Gagal menghapus pengguna')
    } finally {
      isLoadingDelete.value = false
    }
  }
}

const userEmailDisplay = response.value?.data?.email || 'Email Pengguna'

useHead({
  title: isDataFound.value ? `${userEmailDisplay} | Cashier App` : 'Pengguna Tidak Ditemukan | Cashier App',
})
</script>

<template>
  <div v-if="!isDataFound && !pending" class="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-5">
    <div class="bg-gray-100 p-6 rounded-full">
      <UIcon name="i-lucide-user-x" size="64" class="text-gray-400" />
    </div>
    <div>
      <p class="text-2xl font-bold">Pengguna Tidak Ditemukan</p>
      <p class="text-gray">Maaf, data pengguna yang Anda cari tidak tersedia atau telah dihapus.</p>
    </div>
    <UiButton label="Kembali ke List Pengguna" variant="primary" color="yellow" @click="goBack" />
  </div>

  <div v-else-if="isDataFound" class="flex items-start justify-start w-full gap-7 mb-12">
    <img 
       :src="response?.data.image || defaultImage" 
       :alt="response?.data.email" 
       class="w-100 h-100 rounded-full shrink-0 object-cover border-4 border-white shadow-sm" 
     />
    <div class="w-full space-y-4">
      <div class="bg-white rounded-3xl p-16 space-y-6">
        <div class="space-y-1">
          <p class="font-bold text-4xl">{{ response?.data.username || '-' }}</p>
          <div class="flex items-cente justify-start gap-3">
            <p class="text-gray font-bold capitalize">{{ response?.data.email}}</p>
            <p class="text-gray capitalize">|</p>
            <p class="text-gray font-bold capitalize">{{ response?.data.role === 'admin' ? 'Administrator' : 'Kasir' }}</p>
          </div>
        </div>
        <div class="flex items-center justify-start gap-24">
          <div>
            <p class="font-semibold text-gray">Role Pengguna</p>
            <p class="font-bold text-3xl mt-2 capitalize">{{ response?.data.role }}</p>
          </div>
        </div>
      </div>
      
      <div class="flex items-center justify-center gap-4">
          <div class="bg-white space-y-2 p-10 rounded-xl w-full">
              <UIcon name="i-lucide-calendar-days" size="24" class="text-violet-500" />
              <p class="font-semibold text-gray">Tanggal Bergabung</p>
              <p class="font-bold text-2xl">{{ formattedDate }}</p>
          </div>
      </div>  
      
      <div class="flex items-center gap-4">
        <UiButton @click="goToEdit(emailParam)" label="Edit Pengguna" variant="big" icon-name="i-lucide-edit" color="yellow" />
        <UiButton 
          @click="onDelete(emailParam)" 
          variant="square" 
          icon-name="i-lucide-trash" 
          color="ghost" 
          :disabled="isLoadingDelete"
        />
      </div>
    </div>
  </div>
</template>