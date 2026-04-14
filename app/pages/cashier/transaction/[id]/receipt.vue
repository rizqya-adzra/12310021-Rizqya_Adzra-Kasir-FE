<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransaction } from '~/composables/api/useTransaction'

const authStore = useAuthStore() 
const config = useRuntimeConfig()

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { fetchTransactionDetail } = useTransaction()

const { formatRupiah } = usePriceFormatter()

const { data: response, pending, error } = await fetchTransactionDetail(route.params.id as string)

const isDataFound = computed(() => !!response.value?.data)
const transaction = computed(() => response.value?.data)
const isExporting = ref(false)

const goBack = () => {
  router.push('/cashier/transaction/')
}

const handlePrint = () => {
  window.print()
}

const exportTransactionPDF = async (id: string) => {
  try {
    const response = await $fetch<Blob>(`/transactions/${id}/`, {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Token ${authStore.token}` 
      },
      query: { export: 'pdf' }, 
      responseType: 'blob', 
    })
    return response
  } catch (error) {
    console.error('Gagal mengekspor PDF:', error)
    throw error
  }
}

const handleDownloadPDF = async () => {
  if (!transaction.value?.id) return
  
  isExporting.value = true
  try {
    const blob = await exportTransactionPDF(transaction.value.id.toString())
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Struk_${transaction.value.invoice}.pdf`)
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    alert('Terjadi kesalahan saat mengunduh dokumen PDF.')
  } finally {
    isExporting.value = false
  }
}

const invoiceNumber = transaction.value?.invoice || 'Detail Transaksi'

const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }).format(date)
}

useHead({
  title: isDataFound.value ? `Struk ${invoiceNumber} | Cashier App` : 'Transaksi Tidak Ditemukan',
})
</script>

<template>
  <div class="bg-neutral px-80 py-12">
    <div class="flex items-center justify-between mb-8 print:hidden">
      <div class="flex items-start gap-3">
        <UiButton @click="goBack" variant="chip" color="ghost" icon-name="i-lucide-chevron-left" />
        <div>
          <p class="font-bold text-2xl">Cetak Struk</p>
          <div class="flex items-center gap-2 text-sm">
            <p class="text-gray-500">Riwayat Transaksi</p>
            <p class="text-gray-400">/</p>
            <p class="font-bold">{{ isDataFound ? invoiceNumber : 'Not Found' }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="isDataFound" class="flex gap-3">
        <UiButton @click="handleDownloadPDF" :loading="isExporting" variant="primary" icon-name="i-lucide-printer" label="Cetak Struk" />
      </div>
    </div>
  
    <div v-if="!isDataFound && !pending" class="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-5 print:hidden">
      <div class="bg-gray-100 p-6 rounded-full">
        <UIcon name="i-lucide-receipt" size="64" class="text-gray-400" />
      </div>
      <div>
        <p class="text-2xl font-bold">Transaksi Tidak Ditemukan</p>
        <p class="text-gray-500">Maaf, data transaksi yang Anda cari tidak tersedia atau riwayatnya telah dihapus.</p>
      </div>
      <UiButton label="Kembali ke Riwayat" variant="outline" @click="goBack" />
    </div>
  
    <div v-else-if="isDataFound" class="flex justify-center mb-12">
      <div class="bg-white p-8 w-full max-w-sm shadow-xl border border-gray-200 text-gray-800 relative print:shadow-none print:border-none print:p-0">
        
        <div class="absolute top-0 left-0 right-0 h-2 overflow-hidden print:hidden">
          <div class="w-full h-4 -mt-2 bg-gray-50" style="mask-image: radial-gradient(circle 4px at 50% 100%, transparent 0, transparent 4px, black 4px); mask-size: 10px 10px;"></div>
        </div>
  
        <div class="text-center mb-6 mt-2">
          <UIcon name="i-lucide-shopping-bag" size="32" class="text-black mb-2 mx-auto" />
          <h2 class="font-bold text-xl text-black">IndoJuli</h2>
          <p class="text-xs text-gray-500 mt-1">Jl. Alamat Tajur No. <span class="font-mono">123</span>, Kota Bogor<br>Telp: <span class="font-mono">0882-9962-1867</span></p>
        </div>
  
        <div class="border-y border-dashed border-gray-400 py-3 mb-4 text-xs space-y-1.5">
          <div class="flex justify-between">
            <span class="text-gray-500">Waktu</span>
            <span class="font-bold font-mono">{{ formatDate(transaction?.created_at) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">No. Nota</span>
            <span class="font-bold font-mono">{{ transaction?.invoice }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Kasir</span>
            <span class="font-bold uppercase">{{ transaction?.username || 'Sistem' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Pelanggan</span>
            <span class="font-bold uppercase">{{ transaction?.customer_name || 'Umum' }} <span v-if="transaction?.is_member">(M)</span></span>
          </div>
        </div>
  
        <div class="mb-4 space-y-3">
          <div v-for="item in transaction?.details" :key="item.id" class="text-sm">
            <div class="font-bold text-black uppercase mb-0.5">{{ item.product_name }}</div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600 font-mono">{{ item.quantity }} x {{ formatRupiah(item.price) }}</span>
              <span class="font-bold text-black font-mono">{{ formatRupiah(item.subtotal) }}</span>
            </div>
          </div>
        </div>
  
        <div class="border-t border-dashed border-gray-400 pt-3 space-y-1.5 text-sm">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal (<span class="font-mono">{{ transaction?.total_quantity }}</span> item)</span>
            <span class="font-mono">{{ formatRupiah(transaction?.subtotal ?? 0) }}</span>
          </div>
          
          <div v-if="transaction?.is_point" class="flex justify-between text-gray-600">
            <span>Diskon Poin</span>
            <span class="font-mono">-{{ formatRupiah(transaction?.point ?? 0) }}</span>
          </div>
  
          <div class="flex justify-between font-bold text-lg text-black pt-2 border-t border-dashed border-gray-400 mt-2">
            <span>TOTAL</span>
            <span class="font-mono">{{ formatRupiah(transaction?.total ?? 0) }}</span>
          </div>
  
          <div class="flex justify-between pt-2">
            <span class="text-gray-600">Tunai</span>
            <span class="font-bold font-mono">{{ formatRupiah(transaction?.payment_amount ?? 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Kembali</span>
            <span class="font-bold font-mono">{{ formatRupiah(transaction?.change_amount ?? 0) }}</span>
          </div>
        </div>
  
        <div class="mt-8 text-center text-xs text-gray-500">
          <p class="mb-1">Terima Kasih Atas Kunjungan Anda</p>
          <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        </div>
  
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  body {
    background-color: white !important;
  }
  .print\:hidden {
    display: none !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:border-none {
    border: none !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
}
</style>