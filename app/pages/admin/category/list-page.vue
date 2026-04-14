<script setup lang="ts">
import { ref, computed } from 'vue' 
import { useCategory } from '~/composables/api/useCategory'
import { useRouter } from 'vue-router'

definePageMeta({
    middleware: 'auth',
    layout: 'admin'
})

const router = useRouter()

const {
    searchParams,
    limitParams,
    pageParams,
    apiQuery,
} = useFilterPagination()

const tableColumns = [
    { key: 'no', label: '#', class: 'w-16 font-bold text-center' },
    { key: 'name', label: 'Nama Kategori', class: 'font-bold' },
    { key: 'description', label: 'Deskripsi' },
    { key: 'actions', label: '', class: 'w-40 text-right' } 
]

const { fetchCategories, exportCategoryExcel } = useCategory()
const { data: response, pending } = await fetchCategories()

const mappedCategories = computed(() => {
    if (!response.value?.data) return []
    
    let filtered = response.value.data
    if (searchParams.value) {
        const query = searchParams.value.toLowerCase()
        filtered = filtered.filter(cat => cat.name.toLowerCase().includes(query))
    }
    
    return filtered.map((category) => ({
        id: category.id, 
        name: category.name || '-',
        description: category.description || '-',
    }))
})

const goToDetail = (id: string) => {
    router.push(`/admin/category/${id}`)
}

const isExporting = ref(false)

const executeExport = async () => {
  isExporting.value = true
  try {
    const blob = await exportCategoryExcel(apiQuery.value)
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const dateString = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `Data_Kategori_${dateString}.xlsx`) 
    
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error("Terjadi kesalahan saat mengunduh Excel:", error)
  } finally {
    isExporting.value = false
  }
}

useHead({
    title: 'List Kategori | Cashier App',
})
</script>

<template>
    <div class="space-y-7">
        <div class="w-full md:w-1/2">
            <UiInput 
                v-model="searchParams" 
                placeholder="Cari nama kategori..." 
                variant="search" 
                icon="i-lucide-search" 
            />
        </div>

        <div class="flex items-center justify-between">
            <p class="font-bold text-3xl">Manajemen Kategori</p>
            <NuxtLink to="/admin/category/create">
                <UiButton label="Tambah Kategori" variant="primary" icon-name="i-lucide-plus" color="yellow" />
            </NuxtLink>
        </div>

        <div class="flex items-center justify-between gap-4">
            <div class="bg-white space-y-2 p-10 rounded-xl w-full">
                <UIcon name="i-lucide-tags" size="24" class="text-violet-500" />
                <p class="font-semibold text-gray">Total Kategori</p>
                <p class="font-bold text-3xl font-mono">{{ response?.count || 0 }}</p>
            </div>
        </div>

        <UiTable 
            title="Semua List Kategori"
            :columns="tableColumns" 
            :data="mappedCategories"
            :total-items="mappedCategories.length" 
            :displayed-items="mappedCategories.length"
            :loading="pending"
        >
            <template #top-actions>
                <UiDropdownDefault class="ml-auto" v-model="limitParams" />
                <UiButton @click="executeExport" label="Export Excel" variant="export" color="gray" icon-name="i-lucide-upload" />
            </template>
    
            <template #cell-no="{ index }">
                <span class="font-bold text-gray-800">{{ ((pageParams - 1) * limitParams) + index + 1 }}</span>
            </template>
    
            <template #cell-name="{ row }">
               <UiLabel :text="row.name" />
            </template>

            <template #cell-description="{ row }">
                <span class="text-gray-600 text-sm truncate block max-w-[300px]">{{ row.description }}</span>
            </template>
            
            <template #cell-actions="{ row }">
                <UiButton @click="goToDetail(row.id)" variant="chip" color="ghost" icon-name="i-lucide-eye" />
            </template>
        </UiTable>
    </div>
</template>