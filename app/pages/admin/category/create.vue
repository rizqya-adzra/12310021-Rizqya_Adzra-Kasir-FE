<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCategory } from '~/composables/api/useCategory' 

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { createCategory } = useCategory()
const router = useRouter()
const isLoading = ref(false)

const formData = reactive({
    name: '',
    description: '',
})

const errors = reactive({
    name: '',
    description: ''
})

const validateForm = () => {
  let isValid = true
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  if (!formData.name.trim()) {
    errors.name = 'Nama kategori wajib diisi'
    isValid = false
  }

  return isValid
}

const onSubmit = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true

    const payload = {
      name: formData.name,
      description: formData.description
    }

    await createCategory(payload)
    
    router.push('/admin/category/list-page')
    
  } catch (error: any) {
    console.error('Error saat menyimpan kategori:', error)
    if (error.data?.errors) {
        Object.assign(errors, error.data.errors)
    }
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Tambah Kategori | Cashier App',
})
</script>

<template>
    <div class="grid grid-cols-2 gap-6 mb-12">
        <div class="col-span-1 space-y-6">
            <div class="bg-white py-14 px-10 rounded-3xl">
                <div class="flex items-center justify-start gap-4 text-gold mb-6">
                    <UIcon name="i-lucide-tag" size="24" />
                    <p class="font-bold text-3xl">Informasi Kategori</p>
                </div>
                <div class="space-y-4">
                    <UiInput 
                        v-model="formData.name" 
                        label="Nama Kategori*" 
                        placeholder="Masukkan nama kategori" 
                        :error="errors.name" 
                    />
                    <UiInput 
                        v-model="formData.description" 
                        label="Deskripsi" 
                        placeholder="Masukkan deskripsi (opsional)" 
                        :error="errors.description" 
                    />
                </div>
                
                <UiButton 
                    @click="onSubmit"
                    variant="big" 
                    color="yellow" 
                    :label="isLoading ? 'Menyimpan...' : 'Simpan Kategori'" 
                    icon-name="i-lucide-save" 
                    class="mt-10 w-full"
                    :disabled="isLoading"
                />
            </div>
        </div>
    </div>
</template>