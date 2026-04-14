<script setup lang="ts">
import { ref, computed, watch } from 'vue' 
import { useProduct } from '~/composables/api/useProduct'
import { useRoute, useRouter } from 'vue-router'
import defaultImage from '~/assets/images/default_image.jpg'

definePageMeta({
    middleware: 'auth',
    layout: 'cashier'
})

const router = useRouter()

const {
    activeSorts, 
    handleSort,
    searchParams,       
    visibilityParams,  
    maxPriceParams,
    minPriceParams,
    pageParams,
    limitParams,
    apiQuery,
    prevPage,
    nextPage: triggerNextPage,
} = useFilterPagination()

const tableColumns = [
    { key: 'no', label: '#', class: 'w-16 font-bold text-center' },
    { key: 'name', label: 'Nama Produk', class: 'w-[300px]' },
    { key: 'category', label: 'Kategori' },
    { key: 'price', label: 'Harga' },
    { key: 'stock', label: 'Stok' },
    { key: 'actions', label: '', class: 'w-40 text-right' } 
]

const { fetchProducts, exportProductsExcel } = useProduct()
const { formatRupiah } = usePriceFormatter()

const { data: response, pending, refresh } = await fetchProducts(apiQuery)

const mappedProducts = computed(() => {
    if (!response.value?.data) return []
    
    return response.value.data.map((product: any) => ({
        id: product.id,
        image: product.image || defaultImage,
        name: product.name,
        sku: product.sku,
        category: product.category, 
        price: formatRupiah(product.price),
        stock: product.stock,
        min_stock: product.minimal_stock,
        is_low_stock: product.is_low_stock,
    }))
})

const totalPages = computed(() => response.value?.total_pages || 1)
const nextPage = () => triggerNextPage(totalPages.value)

watch(
    () => response.value?.current_page,
    (newCurrentPage) => {
        if (newCurrentPage && newCurrentPage !== pageParams.value) {
            pageParams.value = newCurrentPage
        }
    }
)

const goToDetail = (id: string) => {
    router.push(`/cashier/product/${id}`)
}

const isExporting = ref(false)

const executeExport = async () => {
  isExporting.value = true
  try {
    const blob = await exportProductsExcel(apiQuery.value)
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const dateString = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `Data_Produk_${dateString}.xlsx`) 
    
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
    title: 'List Produk | Cashier App',
})
</script>

<template>
    <div class="space-y-7">
        <div class="flex gap-4 items-start justify-between">
            <div class="w-full md:w-1/2">
                <UiInput 
                    v-model="searchParams" 
                    placeholder="Cari produk..." 
                    variant="search" 
                    icon="i-lucide-search" 
                />
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-4">
                    <span class="text-sm font-bold text-gray">Harga</span>
                    <UiInput v-model="minPriceParams" type="number" color="white" placeholder="Min" class="w-24" />
                    <span class="text-gray">-</span>
                    <UiInput v-model="maxPriceParams" type="number" color="white" placeholder="Max" class="w-24" />
                </div>
                <UiDropdownStatus v-model="visibilityParams" />
            </div>
        </div>
        <div class="flex items-center justify-between">
            <p class="font-bold text-3xl">Manajemen Produk</p>
        </div>
        <UiTable 
            title="Semua List Produk"
            :columns="tableColumns" 
            :data="mappedProducts"
            :total-items="response?.count || 0" 
            :displayed-items="mappedProducts.length"
            :loading="pending"
            @sort="handleSort"
        >
            <template #top-actions>
                <UiDropdownDefault class="ml-auto" v-model="limitParams" />
                <UiButton @click="executeExport" label="Export Excel" variant="export" color="gray" icon-name="i-lucide-upload" />
            </template>
    
            <template #cell-no="{ index }">
                <span class="font-bold text-gray-800">{{ ((pageParams - 1) * limitParams) + index + 1 }}</span>
            </template>

            <template #header-name>
                <div class="flex items-center gap-2 cursor-pointer group" @click="handleSort('name')">
                    <span>Nama Produk</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['name'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['name'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>
    
            <template #cell-name="{ row }">
                <div class="flex items-center gap-4">
                    <img :src="row.image" :alt="row.name" class="w-16 h-16 rounded-xl shrink-0 object-cover" />
                    <div class="flex flex-col">
                        <span class="font-bold text-black text-base">{{ row.name }}</span>
                        <span class="text-gray-500 text-sm font-medium">{{ row.sku }}</span>
                    </div>
                </div>
            </template>
    
            <template #cell-category="{ row }">
                <UiLabel :text="row.category" />
            </template>
    
            <template #header-price>
                <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('price')">
                    <span>Harga</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['price'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['price'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>

            <template #cell-price="{ row }">
                <span class="font-bold text-black text-base font-mono">{{ row.price }}</span>
            </template>

            <template #header-stock>
                <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('stock')">
                    <span>Stok</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['stock'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['stock'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>
    
            <template #cell-stock="{ row }">
                <div class="flex items-center gap-1">
                    <span :class="['font-bold', row.is_low_stock ? 'text-red-600 animate-pulse' : 'text-gray-700']">
                    {{ row.stock }}
                    </span>
                    <UIcon 
                        v-if="row.is_low_stock" 
                        name="i-lucide-triangle-alert" 
                        class="text-red-500 animate-pulse size-4"
                    />
                </div>
            </template>
            
            <template #cell-min_stock="{ row }">
                <span class="font-bold text-black">{{ row.min_stock }}</span>
            </template>
            
            <template #cell-actions="{ row }">
                <UiButton @click="goToDetail(row.id)" variant="chip" color="ghost" icon-name="i-lucide-eye" />
            </template>
    
            <template #pagination>
                <UiButton variant="square" color="ghost" icon-name="i-lucide-chevron-left" :disabled="pageParams === 1" @click="prevPage" />
                <div class="flex items-center px-2">
                    <span class="font-bold text-sm">{{ pageParams }} / {{ totalPages }}</span>
                </div>
                <UiButton variant="square" color="ghost" icon-name="i-lucide-chevron-right" :disabled="pageParams >= totalPages" @click="nextPage" />
            </template>
        </UiTable>
    </div>
</template>