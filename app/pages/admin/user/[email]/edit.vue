<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUser } from '~/composables/api/useUser' 

definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { fetchUserDetail, updateUser } = useUser()
const fileInput = ref<HTMLInputElement>()
  
const emailParam = route.params.email as string

const isLoading = ref(false)
const isFetching = ref(true)

const roleOptions = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Kasir', value: 'cashier' }
]

const staffOptions = [
  { label: 'Aktif', value: true },
  { label: 'Non-Aktif', value: false }
]

const formData = reactive({
  username: '',
  email: '',
  role: 'cashier',
  is_staff: true,
  image: null as File | null,
  password: '' 
})

const errors = reactive({
  username: '',
  email: '',
  role: '',
  password: ''
})

const currentImageUrl = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data: response } = await fetchUserDetail(emailParam)
    if (response.value?.data) {
      const u = response.value.data
      formData.username = u.username
      formData.email = u.email
      formData.role = u.role
      formData.is_staff = u.is_staff
      
      currentImageUrl.value = u.image
    }
  } catch (err) {
    console.error('Gagal mengambil data pengguna:', err)
  } finally {
    isFetching.value = false
  }
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    formData.image = file
    
    if (currentImageUrl.value && currentImageUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageUrl.value)
    }
    
    currentImageUrl.value = URL.createObjectURL(file)
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const removeImage = () => {
  formData.image = null
  
  if (currentImageUrl.value && currentImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentImageUrl.value)
  }
  
  currentImageUrl.value = null
}

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => { errors[key as keyof typeof errors] = '' })

  if (!formData.email.trim()) { 
    errors.email = 'Email wajib diisi'
    isValid = false 
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Format email tidak valid'
    isValid = false
  }

  return isValid
}

const onSubmit = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    const payload = new FormData()
    
    payload.append('username', formData.username)
    payload.append('email', formData.email)
    payload.append('role', formData.role)
    payload.append('is_staff', formData.is_staff ? 'true' : 'false')

    if (formData.password.trim()) {
      payload.append('password', formData.password)
    }

    if (formData.image) {
      payload.append('image', formData.image)
    }

    await updateUser(emailParam, payload)
    
    router.push(`/admin/user/${formData.email}`)

    await Promise.all([
      refreshNuxtData('users-list'),
      refreshNuxtData(`user-detail-${formData.email}`)
    ])
    
  } catch (error: any) {
    if (error.data?.errors) {
      Object.assign(errors, error.data.errors)
    } else {
      alert('Terjadi kesalahan saat menyimpan data.')
    }
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Edit Pengguna | Cashier App',
})
</script>

<template>
    <div v-if="isFetching" class="flex justify-center py-20">
      <p class="animate-pulse font-bold text-gray text-xl">Memuat data pengguna...</p>
    </div>

    <div v-else class="grid grid-cols-2 gap-6 mb-12">
        <div class="col-span-1 space-y-6">
            <div class="bg-white py-14 px-10 rounded-3xl">
                <div class="flex items-center justify-start gap-4 text-gold mb-6">
                    <UIcon name="i-lucide-user" size="24" />
                    <p class="font-bold text-3xl">Informasi Pengguna</p>
                </div>
                <div class="space-y-4">
                    <UiInput 
                        v-model="formData.username" 
                        label="Nama Pengguna*" 
                        placeholder="contoh@gmail.com" 
                        :error="errors.username" 
                    />
                    <UiInput 
                        v-model="formData.email" 
                        label="Email Pengguna*" 
                        placeholder="contoh@gmail.com" 
                        :error="errors.email" 
                    />
                    <UiInput 
                        v-model="formData.password" 
                        label="Password Baru" 
                        type="password"
                        placeholder="-" 
                        :error="errors.password" 
                    />
                    <div>
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
                          v-if="!currentImageUrl"
                      />

                      <div v-if="currentImageUrl" class="relative inline-block group mt-2">
                          <img :src="currentImageUrl" alt="Preview" class="max-w-xs max-h-48 object-cover rounded-lg border" />
                          
                          <button 
                              @click="removeImage"
                              class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm transition-all"
                          >
                              Hapus
                          </button>
                      </div>
                    </div>
                </div>
            </div>

            <div class="bg-white py-14 px-10 rounded-3xl">
                <div class="flex items-center justify-start gap-4 text-gold mb-6">
                    <UIcon name="i-lucide-shield" size="24" />
                    <p class="font-bold text-3xl">Role Pengguna</p>
                </div>
                
                <div class="space-y-6">
                    <div>
                        <p class="font-semibold mb-3 text-sm">Peran Sistem</p>
                        <div class="flex flex-wrap items-center justify-start gap-3">
                            <UiButton 
                                v-for="option in roleOptions" 
                                :key="option.value"
                                variant="chip" 
                                :color="formData.role === option.value ? 'blue' : 'ghost'" 
                                :label="option.label"
                                @click="formData.role = option.value"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <div class="col-span-1 space-y-6">
            <div class="bg-white py-14 px-10 rounded-3xl sticky top-2">
                <UiButton 
                    @click="onSubmit"
                    variant="big" 
                    color="yellow" 
                    :label="isLoading ? 'Menyimpan...' : 'Perbarui Pengguna'" 
                    icon-name="i-lucide-save" 
                    :disabled="isLoading"
                />
            </div>
        </div>
    </div>
</template>