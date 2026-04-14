<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCategory } from '~/composables/api/useCategory'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { fetchCategoryDetail, deleteCategory } = useCategory()

const idParam = route.params.id as string

const { data: response, pending } = await fetchCategoryDetail(idParam)
const isLoadingDelete = ref(false)

const isDataFound = computed(() => !!response.value?.data)

const goToEdit = (id: string) => {
  router.push(`/admin/category/${id}/edit`)
}

const goBack = () => {
  router.push('/admin/category/list-page') 
}

const onDelete = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
    try {
      isLoadingDelete.value = true
      await deleteCategory(id)
      router.push('/admin/category/list-page')
    } catch (error) {
      alert('Gagal menghapus kategori')
    } finally {
      isLoadingDelete.value = false
    }
  }
}

const categoryDisplay = response.value?.data?.name || 'Kategori'

useHead({
  title: isDataFound.value ? `${categoryDisplay} | Cashier App` : 'Kategori Tidak Ditemukan | Cashier App',
})
</script>

<template>
  <div v-if="!isDataFound && !pending" class="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-5">
    <div class="bg-gray-100 p-6 rounded-full">
      <UIcon name="i-lucide-folder-x" size="64" class="text-gray-400" />
    </div>
    <div>
      <p class="text-2xl font-bold">Kategori Tidak Ditemukan</p>
      <p class="text-gray">Maaf, data kategori yang Anda cari tidak tersedia atau telah dihapus.</p>
    </div>
    <UiButton label="Kembali ke List Kategori" variant="primary" color="yellow" @click="goBack" />
  </div>

  <div v-else-if="isDataFound" class="w-full space-y-4">
    <div class="bg-white rounded-3xl p-16 space-y-6">
      <div class="space-y-1">
        <p class="font-bold text-4xl">{{ response?.data.name || '-' }}</p>
        <p class="text-gray text-lg mt-2">{{ response?.data.description || 'Tidak ada deskripsi' }}</p>
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <UiButton @click="goToEdit(idParam)" label="Edit Kategori" variant="big" icon-name="i-lucide-edit" color="yellow" />
      <UiButton 
        @click="onDelete(idParam)" 
        variant="square" 
        icon-name="i-lucide-trash" 
        color="ghost" 
        :disabled="isLoadingDelete"
      />
    </div>
  </div>
</template>