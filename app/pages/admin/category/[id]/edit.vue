<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProduct } from '~/composables/api/useProduct' 

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { fetchProductDetail, updateProduct } = useProduct()
const id = route.params.id as string
const isLoading = ref(false)
const isFetching = ref(true)
const productId = route.params.id as string

const selectedVisibility = ref('active')
const visibilityOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Admin Only', value: 'admin only' } 
]

const formData = reactive({
  category_id: '',
  name: '',
  description: '',
  price: 0,
  stock: 0,
  minimal_stock: 0,
  image: null as File | null,
})

const errors = reactive({
  category_id: '',
  name: '',
  description: '',
  price: '',
  stock: '',
  minimal_stock: ''
})

const currentImageUrl = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data: response } = await fetchProductDetail(productId)
    if (response.value?.data) {
      const p = response.value.data
      formData.category_id = p.category_id
      formData.name = p.name
      formData.description = p.description
      formData.price = p.price
      formData.stock = p.stock
      formData.minimal_stock = p.minimal_stock
      currentImageUrl.value = p.image
      selectedVisibility.value = p.visibility
    }
  } catch (err) {
    console.error('Gagal mengambil data produk:', err)
  } finally {
    isFetching.value = false
  }
})

const handleFileChange = (file: File | null) => {
  if (file) {
    formData.image = file
    currentImageUrl.value = URL.createObjectURL(file)
  } else {
    formData.image = null
    currentImageUrl.value = null
  }
}

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => { errors[key as keyof typeof errors] = '' })

  if (!formData.category_id) { errors.category_id = 'Kategori harus dipilih'; isValid = false }
  if (!formData.name.trim()) { errors.name = 'Nama produk wajib diisi'; isValid = false }
  if (Number(formData.price) <= 0) { errors.price = 'Harga produk harus lebih dari 0'; isValid = false }

  return isValid
}

const onSubmit = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    const payload = new FormData()
    
    payload.append('category_id', formData.category_id)
    payload.append('name', formData.name)
    payload.append('description', formData.description)
    payload.append('price', String(formData.price))
    payload.append('stock', String(formData.stock))
    payload.append('minimal_stock', String(formData.minimal_stock))
    payload.append('visibility', selectedVisibility.value)

    if (formData.image) {
      payload.append('image', formData.image)
    }

    await updateProduct(productId, payload)
    router.push(`/admin/product/${productId}`)

    await Promise.all([
      refreshNuxtData('products-list'),
      refreshNuxtData(`product-detail-${id}`)
    ])
    
  } catch (error: any) {
    if (error.data?.errors) {
        Object.assign(errors, error.data.errors)
    }
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Edit Produk | Cashier App',
})
</script>

<template>
    <div v-if="isFetching" class="flex justify-center py-20">
      <p class="animate-pulse font-bold text-gray text-xl">Memuat data produk...</p>
    </div>

    <div v-else class="grid grid-cols-2 gap-6 mb-12">
        <div class="col-span-1 space-y-6">
            <div class="bg-white py-14 px-10 rounded-3xl">
                <div class="flex items-center justify-start gap-4 text-gold mb-6">
                    <UIcon name="i-lucide-book-text" size="24" />
                    <p class="font-bold text-3xl">Informasi Produk</p>
                </div>
                <div class="space-y-4">
                    <UiDropdownCategory 
                        v-model="formData.category_id" 
                        label="Kategori*" 
                        placeholder="Pilih Kategori Produk" 
                        :error="errors.category_id"
                    />

                    <UiInput 
                        v-model="formData.name" 
                        label="Nama Produk*" 
                        placeholder="Nama Produk" 
                        :error="errors.name" 
                    />
                    
                    <UiInput 
                        v-model="formData.description" 
                        label="Deskripsi*" 
                        type="textarea"
                        placeholder="Jelaskan detail produk di sini..." 
                        :error="errors.description" 
                    />
                </div>
            </div>

            <div class="bg-white py-14 px-10 rounded-3xl">
                <div class="flex items-center justify-start gap-4 text-gold mb-6">
                    <UIcon name="i-lucide-circle-dollar-sign" size="24" />
                    <p class="font-bold text-3xl">Stok & Harga</p>
                </div>
                <div class="flex items-center justify-start gap-5">
                    <UiInput 
                        v-model="formData.price"
                        label="Harga Produk*"
                        placeholder="0"
                        prefix="Rp."
                        data-type="integer"
                        :error="errors.price"
                    />
                    <UiInput 
                        v-model="formData.stock"
                        label="Stok*"
                        placeholder="0"
                        data-type="integer"
                        :error="errors.stock"
                    />
                    <UiInput 
                        v-model="formData.minimal_stock"
                        label="Minimal Stok*"
                        placeholder="0"
                        data-type="integer"
                        :error="errors.minimal_stock"
                    />
                </div>
            </div>
        </div>

        <div class="col-span-1 space-y-6">
            <div class="bg-white py-14 px-10 rounded-3xl">
                <div class="flex items-center justify-start gap-4 text-gold mb-6">
                    <UIcon name="i-lucide-image" size="24" />
                    <p class="font-bold text-3xl">Gambar Produk</p>
                </div>
                
                <UiFileDragAndDrop 
                  :initial-url="currentImageUrl"
                  @update:model-value="handleFileChange" 
                />
                <p class="text-xs text-gray mt-2 italic">*Biarkan kosong jika tidak ingin mengubah gambar</p>
            </div>
            
            <div class="bg-white py-14 px-10 rounded-3xl">
                <div class="flex items-center justify-start gap-4 text-gold mb-6">
                    <UIcon name="i-lucide-eye" size="24" />
                    <p class="font-bold text-3xl">Visibilitas</p>
                </div>
                <div class="flex flex-wrap items-center justify-start gap-5">
                    <UiButton 
                        v-for="option in visibilityOptions" 
                        :key="option.value"
                        variant="chip" 
                        :color="selectedVisibility === option.value ? 'blue' : 'ghost'" 
                        :label="option.label"
                        @click="selectedVisibility = option.value"
                    />
                </div>
                
                <UiButton 
                    @click="onSubmit"
                    variant="big" 
                    color="yellow" 
                    :label="isLoading ? 'Menyimpan...' : 'Perbarui Produk'" 
                    icon-name="i-lucide-save" 
                    class="mt-10 w-full"
                    :disabled="isLoading"
                />
            </div>
        </div>
    </div>
</template>