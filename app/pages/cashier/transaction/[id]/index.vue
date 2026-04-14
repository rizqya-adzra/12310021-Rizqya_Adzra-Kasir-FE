<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransaction } from '~/composables/api/useTransaction'
import defaultProfile from '~/assets/images/default_profile.jpg'

definePageMeta({
  middleware: 'auth',
  layout: 'cashier'
})

const route = useRoute()
const router = useRouter()
const { fetchTransactionDetail } = useTransaction()
const { formatRupiah } = usePriceFormatter()

const { data: response, pending, error } = await fetchTransactionDetail(route.params.id as string)

const isDataFound = computed(() => !!response.value?.data)
const transaction = computed(() => response.value?.data)

const goBack = () => {
  router.push('/cashier/transaction/')
}

const goReceipt = () => {
  router.push('/cashier/transaction/' + route.params.id + '/receipt')
}

const invoiceNumber = transaction.value?.invoice || 'Detail Transaksi'

const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date) + ' WIB'
}

useHead({
  title: isDataFound.value ? `${invoiceNumber} | Cashier App` : 'Transaksi Tidak Ditemukan | Cashier App',
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-start gap-3 mb-10">
      <UiButton @click="goBack" variant="chip" color="ghost" icon-name="i-lucide-chevron-left" />
      <div>
        <p class="font-bold text-2xl">Detail Transaksi</p>
        <div class="flex items-center gap-3">
          <p class="font-bold text-gray">Riwayat Transaksi</p>
          <p class="font-bold text-gray">/</p>
          <p class="font-bold">{{ isDataFound ? 'Detail Transaksi' : 'Not Found' }}</p>
        </div>
      </div>
    </div>
    <UiButton @click="goReceipt()"  variant="primary" icon-name="i-lucide-eye" label="Lihat Struk" />
  </div>

  <div v-if="!isDataFound && !pending" class="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-5">
    <div class="bg-gray-100 p-6 rounded-full">
      <UIcon name="i-lucide-receipt" size="64" class="text-gray-400" />
    </div>
    <div>
      <p class="text-2xl font-bold">Transaksi Tidak Ditemukan</p>
      <p class="text-gray">Maaf, data transaksi yang Anda cari tidak tersedia atau riwayatnya telah dihapus.</p>
    </div>
    <UiButton label="Kembali ke Riwayat" variant="primary" color="yellow" @click="goBack" />
  </div>

  <div v-else-if="isDataFound" class="grid grid-cols-1 lg:grid-cols-3 gap-7 mb-12">
    
    <div class="col-span-1 space-y-6">
      <div class="bg-white rounded-3xl p-10 space-y-6">
        <div>
           <p class="font-semibold text-gray mb-1">No. Invoice</p>
           <p class="font-bold text-2xl text-violet-600">{{ transaction?.invoice }}</p>
        </div>
        
        <div>
           <p class="font-semibold text-gray mb-1">Tanggal & Waktu</p>
           <p class="font-bold text-lg text-black">{{ formatDate(transaction?.created_at) }}</p>
        </div>

        <hr class="border-gray-200" />

        <div>
           <p class="font-semibold text-gray mb-1">Pelanggan</p>
           <div class="flex items-center gap-2 mb-1">
               <p class="font-bold text-lg text-black">{{ transaction?.customer_name || 'Pelanggan Umum' }}</p>
               <UiLabel v-if="transaction?.is_member" text="Member" variant="solid" color="green" />
           </div>
           <p v-if="transaction?.telephone" class="text-gray text-sm">{{ transaction?.telephone }}</p>
           <p v-if="transaction?.point" class="text-gray text-sm">{{ transaction?.point }}</p>
        </div>

        <hr class="border-gray-200" />

        <div>
            <p class="font-semibold text-gray mb-3">Dilayani oleh</p>
            <div class="flex items-center gap-3">
                <img 
                   :src="transaction?.image || defaultProfile" 
                   alt="Kasir" 
                   class="w-12 h-12 rounded-full object-cover border border-gray-200" 
                />
                <p class="font-bold text-lg text-black">{{ transaction?.username || 'Sistem' }}</p>
            </div>
        </div>
      </div>
    </div>

    <div class="col-span-1 lg:col-span-2 space-y-6">
      <div class="bg-white rounded-3xl p-10">
        <p class="font-bold text-2xl mb-8">Detail Belanjaan</p>
        
        <div class="space-y-4 mb-8">
            <div 
                v-for="(item, index) in transaction?.details" 
                :key="item.id" 
                class="flex justify-between items-start border-b border-gray-100 pb-4"
            >
                <div>
                    <p class="font-bold text-lg text-black">{{ item.product_name }}</p>
                    <p class="text-gray text-sm">{{ item.quantity }} item x {{ formatRupiah(item.price) }}</p>
                </div>
                <p class="font-bold text-xl text-black font-mono mt-1">{{ formatRupiah(item.subtotal) }}</p>
            </div>
        </div>

        <div class="bg-gray-50 rounded-2xl p-8 space-y-4">
            <div class="flex justify-between items-center text-gray-600 font-medium">
                <p>Subtotal ({{ transaction?.total_quantity }} item)</p>
                <p class="font-mono">{{ formatRupiah(transaction?.subtotal ?? 0) }}</p>
            </div>
            
            <div v-if="transaction?.is_point" class="flex justify-between items-center font-medium">
                <p class="text-gray-600">Diskon Poin</p>
                <p class="font-mono text-red-500">- {{ formatRupiah(transaction?.point ?? 0) }}</p>
            </div>

            <hr class="border-gray-300 border-dashed my-4" />

            <div class="flex justify-between items-center">
                <p class="font-bold text-2xl text-black">Total Transaksi</p>
                <p class="font-bold text-3xl text-gold font-mono">{{ formatRupiah(transaction?.total ?? 0) }}</p>
            </div>

            <div class="flex justify-between items-center text-gray-600 mt-6 font-medium">
                <p>Tunai Dibayar</p>
                <p class="font-mono">{{ formatRupiah(transaction?.payment_amount ?? 0) }}</p>
            </div>
            
            <div class="flex justify-between items-center text-gray-600 font-medium">
                <p>Kembalian</p>
                <p class="font-mono">{{ formatRupiah(transaction?.change_amount ?? 0) }}</p>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>