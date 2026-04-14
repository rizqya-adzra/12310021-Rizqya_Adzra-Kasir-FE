<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useProduct } from '~/composables/api/useProduct' 

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { createProduct } = useProduct()
const router = useRouter()
const isLoading = ref(false)
const fileInput = ref<HTMLInputElement>()
const imagePreview = ref<string | null>(null)

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

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    formData.image = file
    
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value)
    }
    
    imagePreview.value = URL.createObjectURL(file)
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = () => {
  formData.image = null
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const validateForm = () => {
  let isValid = true
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  if (!formData.category_id) {
    errors.category_id = 'Kategori harus dipilih'
    isValid = false
  }
  if (!formData.name.trim()) {
    errors.name = 'Nama produk wajib diisi'
    isValid = false
  }
  if (!formData.description.trim()) {
    errors.description = 'Deskripsi produk wajib diisi'
    isValid = false
  }
  if (Number(formData.price) <= 0) {
    errors.price = 'Harga produk harus lebih dari 0'
    isValid = false
  }
  if (Number(formData.stock) < 0) {
    errors.stock = 'Stok tidak boleh minus'
    isValid = false
  }
  if (Number(formData.minimal_stock) < 0) {
    errors.minimal_stock = 'Minimal stok tidak boleh minus'
    isValid = false
  }

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
    payload.append('price', String(formData.price || 0))
    payload.append('stock', String(formData.stock || 0))
    payload.append('minimal_stock', String(formData.minimal_stock || 0))
    payload.append('visibility', selectedVisibility.value)

    if (formData.image) {
      payload.append('image', formData.image)
    }

    await createProduct(payload)
    router.push('/admin/product/list-page')
    
  } catch (error: any) {
    console.error('Error saat menyimpan produk:', error)
    if (error.data?.errors) {
        Object.assign(errors, error.data.errors)
    }
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Tambah Produk | Cashier App',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6 mb-12">
      <div class="col-span-1 space-y-6">
          <div class="bg-white py-14 px-10 rounded-3xl">
              <p class="font-bold text-3xl text-gold mb-4">Informasi Produk</p>
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
                <div>
                  <p class="font-bold text-gray mb-2">Gambar Produk</p>
                  
                  <input 
                      ref="fileInput"
                      type="file" 
                      accept="image/*" 
                      @change="handleFileChange" 
                      class="hidden"
                  />
                  
                  <UiButton 
                      variant="chip"
                      color="gray"
                      label="Unggah Gambar"
                      icon-name="i-lucide-save"
                      @click="triggerFileInput"
                      v-if="!imagePreview"
                  />

                  <div v-if="imagePreview" class="mt-4 relative inline-block group">
                      <img :src="imagePreview" alt="Preview" class="max-w-xs max-h-48 object-cover rounded-lg border" />
                      
                      <button 
                          @click="removeImage"
                          class="cursor-pointer absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm transition-all"
                      >
                          Hapus
                      </button>
                  </div>
                </div>
            </div>
          </div>
          <div class="bg-white py-14 px-10 rounded-3xl">
              <p class="font-bold text-3xl text-gold mb-4">Stok & Harga</p>
              <UiInput 
                  v-model="formData.price"
                  label="Harga Produk*"
                  placeholder="0"
                  prefix="Rp."
                  data-type="integer"
                  :error="errors.price"
              />
              <div class="flex items-center justify-start gap-5 mt-3">
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
          <div class="bg-white py-14 px-10 rounded-3xl sticky top-2">
              <p class="font-bold text-3xl text-gold mb-4">Visibilitas</p>
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
                  :label="isLoading ? 'Menyimpan...' : 'Simpan Produk'" 
                  icon-name="i-lucide-save" 
                  class="mt-10 w-full"
                  :disabled="isLoading"
              />
          </div>
      </div>
  </div>
</template>