<script setup lang="ts">
import { computed, watch } from 'vue' 
import { useTransaction } from '~/composables/api/useTransaction' 
import { useRoute, useRouter } from 'vue-router'
import defaultImage from '~/assets/images/default_image.jpg'

definePageMeta({
    middleware: 'auth',
    layout: 'admin'
})

const router = useRouter()

const {
    activeSorts, 
    handleSort,
    searchParams,       
    pageParams,
    limitParams,
    apiQuery,
    prevPage,
    nextPage: triggerNextPage,
} = useFilterPagination()

const tableColumns = [
    { key: 'no', label: '#', class: 'w-16 font-bold text-center' },
    { key: 'invoice', label: 'No. Invoice', class: 'w-[200px]' },
    { key: 'customer', label: 'Pelanggan' }, 
    { key: 'created_at', label: 'Tanggal Transaksi' },
    { key: 'username', label: 'Kasir' },
    { key: 'total_quantity', label: 'Jumlah Produk', class: 'text-center' },
    { key: 'total', label: 'Total Harga' },
    { key: 'actions', label: '', class: 'w-32 text-right' } 
]

const { fetchTransactions } = useTransaction()
const { formatRupiah } = usePriceFormatter()

const { data: response, pending, refresh } = await fetchTransactions(apiQuery)

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date) + ' WIB'
}

const mappedTransactions = computed(() => {
    if (!response.value?.data) return []
    
    return response.value.data.map((trx: any) => ({
        id: trx.id,
        invoice: trx.invoice,
        image: trx.image || defaultImage,
        username: trx.username,
        customer_name: trx.customer_name, 
        telephone: trx.telephone,         
        is_member: trx.is_member,         
        total_quantity: trx.total_quantity,
        total: formatRupiah(trx.total),
        created_at: formatDate(trx.created_at)
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
    router.push(`/admin/transaction/${id}`)
}

useHead({
    title: 'Riwayat Transaksi | Cashier App',
})
</script>

<template>
    <div class="space-y-7">
        <div class="flex items-center justify-between">
            <p class="font-bold text-3xl">Riwayat Transaksi</p>
            <div class="w-full md:w-1/3">
                <UiInput 
                    v-model="searchParams" 
                    placeholder="Cari No. Invoice..." 
                    variant="search" 
                    icon="i-lucide-search" 
                />
            </div>
        </div>

        <div class="flex items-center justify-between gap-4">
            <div class="bg-white space-y-2 p-10 rounded-xl w-full ">
                <UIcon name="i-lucide-receipt" size="24" class="text-violet-500" />
                <p class="font-semibold text-gray">Total Transaksi</p>
                <p class="font-bold text-3xl font-mono">{{ response?.count || 0 }}</p>
            </div>
        </div>

        <UiTable 
            title="Semua Transaksi"
            :columns="tableColumns" 
            :data="mappedTransactions"
            :total-items="response?.count || 0" 
            :displayed-items="mappedTransactions.length"
            :loading="pending"
            @sort="handleSort"
        >
            <template #top-actions>
                <UiDropdownDefault class="ml-auto" v-model="limitParams" />
            </template>
    
            <template #cell-no="{ index }">
                <span class="font-bold text-gray-800">{{ ((pageParams - 1) * limitParams) + index + 1 }}</span>
            </template>

            <template #header-invoice>
                <div class="flex items-center gap-2 cursor-pointer group" @click="handleSort('invoice')">
                    <span>No. Invoice</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['invoice'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['invoice'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>
            <template #cell-invoice="{ row }">
                <span class="font-bold text-violet-600 text-base">{{ row.invoice }}</span>
            </template>
    
            <template #header-created_at>
                <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('created_at')">
                    <span>Tanggal</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['created_at'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['created_at'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>
            <template #cell-created_at="{ row }">
                <span class="text-gray-600 text-sm font-medium">{{ row.created_at }}</span>
            </template>

            <template #cell-customer="{ row }">
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-black text-base">{{ row.customer_name || 'Umum' }}</span>
                        <UiLabel v-if="row.is_member" text="Member" variant="solid" color="green" />
                    </div>
                    <span v-if="row.telephone" class="text-gray-500 text-sm mt-0.5">{{ row.telephone }}</span>
                </div>
            </template>
            <template #cell-username="{ row }">
                <div class="flex items-center gap-3">
                    <img :src="row.image" :alt="row.username" class="w-10 h-10 rounded-full shrink-0 object-cover border border-gray-200" />
                    <div class="flex flex-col">
                        <span class="font-bold text-black text-base">{{ row.username }}</span>
                    </div>
                </div>
            </template>

            <template #header-total_quantity>
                <div class="flex items-center justify-center gap-2 cursor-pointer" @click="handleSort('total_quantity')">
                    <span>Jumlah Produk</span>
                </div>
            </template>
            <template #cell-total_quantity="{ row }">
                <div class="text-center font-bold text-gray-800">
                    {{ row.total_quantity }} <span class="text-xs font-normal text-gray-500">item</span>
                </div>
            </template>

            <template #header-total>
                <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('total')">
                    <span>Total Harga</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['total'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['total'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>
            <template #cell-total="{ row }">
                <span class="font-bold text-black text-base font-mono">{{ row.total }}</span>
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