<script setup lang="ts">
import { useProduct } from '~/composables/api/useProduct'
import { useRoute, useRouter } from 'vue-router'
import defaultImage from '~/assets/images/default_image.jpg'

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { fetchProductDetail, deleteProduct } = useProduct()
const { formatRupiah } = usePriceFormatter()

const { data: response, pending, error } = await fetchProductDetail(route.params.id as string)

const isLoadingDelete = ref(false)

const isDataFound = computed(() => !!response.value?.data)

const goToEdit = (id: string) => {
  router.push(`/admin/product/${id}/edit`)
}

const onDelete = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
    try {
      isLoadingDelete.value = true
      await deleteProduct(id)
      router.push('/admin/product/list-page')
    } catch (error) {
      alert('Gagal menghapus produk')
    } finally {
      isLoadingDelete.value = false
    }
  }
}

const productName = response.value?.data?.name || 'Nama Produk'

useHead({
  title: isDataFound.value ? `${productName} | Cashier App` : 'Produk Tidak Ditemukan | Cashier App',
})
</script>

<template>
  <div v-if="!isDataFound && !pending" class="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-5">
    <div class="bg-gray-100 p-6 rounded-full">
      <UIcon name="i-lucide-package-search" size="64" class="text-gray-400" />
    </div>
    <div>
      <p class="text-2xl font-bold">Produk Tidak Ditemukan</p>
      <p class="text-gray">Maaf, data produk yang Anda cari tidak tersedia atau telah dihapus.</p>
    </div>
    <UiButton label="Kembali ke List Produk" variant="primary" color="yellow" @click="goBack" />
  </div>

  <div v-else-if="isDataFound" class="flex items-start justify-start w-full gap-7 mb-12">
    <img 
       :src="response?.data.image || defaultImage" 
       :alt="response?.data.name" 
       class="w-100 h-100 rounded-xl shrink-0 object-cover" 
     />
    <div class="w-full space-y-4">
      <div class="bg-white rounded-3xl p-16 space-y-6">
        <p class="font-bold text-4xl">{{ response?.data.name }}</p>
        <p class="text-gray">{{ response?.data.description }}</p>
        
        <div class="flex items-center justify-start gap-24">
          <div>
            <p class="font-semibold text-gray">Harga</p>
            <p class="font-bold text-4xl text-gold" style="font-family: 'Space Mono', monospace;">{{ formatRupiah(response?.data.price)}}</p>
          </div>
          <div>
            <p class="font-semibold text-gray">Stok Tersedia</p>
            <p class="font-bold text-4xl text-gold" style="font-family: 'Space Mono', monospace;">{{ response?.data.stock }}</p>
          </div>
          <div>
            <p class="font-semibold text-gray">Min Stok</p>
            <p class="font-bold text-4xl text-gold" style="font-family: 'Space Mono', monospace;">{{ response?.data.minimal_stock }}</p>
          </div>
        </div>
        <div class="space-y-2">
          <p class="font-semibold text-gray">Kategori</p>
          <UiLabel :text="response?.data.category ?? ''" variant="solid" />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <UiButton @click="goToEdit(route.params.id as string)" label="Edit Produk" variant="big" icon-name="i-lucide-edit" color="yellow" />
        <UiButton 
          @click="onDelete(route.params.id as string)" 
          variant="square" 
          icon-name="i-lucide-trash" 
          color="ghost" 
          :disabled="isLoadingDelete"
        />
      </div>
    </div>
  </div>
</template>