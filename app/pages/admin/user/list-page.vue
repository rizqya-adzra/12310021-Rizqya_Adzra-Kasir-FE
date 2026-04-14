<script setup lang="ts">
import { ref, computed, watch } from 'vue' 
import { useUser } from '~/composables/api/useUser'
import { useRoute, useRouter } from 'vue-router'
import defaultImage from '~/assets/images/default_image.jpg'

definePageMeta({
    middleware: 'auth',
    layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
    activeSorts, 
    handleSort,
    roleParams,
    searchParams,      
    pageParams,
    limitParams,
    apiQuery,
    prevPage,
    nextPage: triggerNextPage,
} = useFilterPagination()

const tableColumns = [
    { key: 'no', label: '#', class: 'w-16 font-bold text-center' },
    { key: 'username', label: 'Nama', class: 'w-16 font-bold' },
    { key: 'email', label: 'Pengguna', class: 'w-[300px]' },
    { key: 'role', label: 'Peran' },
    { key: 'created_at', label: 'Tanggal Bergabung' },
    { key: 'actions', label: '', class: 'w-40 text-right' } 
]

const { fetchUsers, exportUsersExcel } = useUser()

const { data: response, pending } = await fetchUsers(apiQuery)

const mappedUsers = computed(() => {
    if (!response.value?.data) return []
    
    return response.value.data.map((user: any) => ({
        id: user.id || user.email, 
        image: user.image || defaultImage,
        username: user.username || '-',
        email: user.email,
        role: user.role, 
        is_staff: user.is_staff ? 'Aktif' : 'Non-Aktif',
        created_at: new Date(user.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
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

const goToDetail = (email: string) => {
    router.push(`/admin/user/${email}`)
}

const toggleRoleFilter = () => {
  if (roleParams.value === 'admin') {
    roleParams.value = 'cashier'
  } else if (roleParams.value === 'cashier') {
    roleParams.value = '' 
  } else {
    roleParams.value = 'admin'
  }
}

const onTableSort = (key: string) => {
    if (key === 'role') {
        toggleRoleFilter() 
    } else {
        handleSort(key)   
    }
}

const isExporting = ref(false)

const executeExport = async () => {
  isExporting.value = true
  try {
    const blob = await exportUsersExcel(apiQuery.value)
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const dateString = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `Data_Pengguna_${dateString}.xlsx`) 
    
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
    title: 'List Pengguna | Cashier App',
})
</script>

<template>
    <div class="space-y-7">
        <div class="w-full md:w-1/2">
            <UiInput 
                v-model="searchParams" 
                placeholder="Cari email pengguna..." 
                variant="search" 
                icon="i-lucide-search" 
            />
        </div>

        <div class="flex items-center justify-between">
            <p class="font-bold text-3xl">Manajemen Pengguna</p>
            <NuxtLink to="/admin/user/create">
                <UiButton label="Tambah Pengguna" variant="primary" icon-name="i-lucide-plus" color="yellow" />
            </NuxtLink>
        </div>

        <div class="flex items-center justify-between gap-4">
            <div class="bg-white space-y-2 p-10 rounded-xl w-full">
                <UIcon name="i-lucide-users" size="24" class="text-violet-500" />
                <p class="font-semibold text-gray">Total Pengguna</p>
                <p class="font-bold text-3xl font-mono">{{ response?.count || 0 }}</p>
            </div>
            <div class="bg-white space-y-2 p-10 rounded-xl w-full">
                <UIcon name="i-lucide-shield-check" size="24" class="text-green-500" />
                <p class="font-semibold text-gray">Admin Aktif</p>
                <p class="font-bold text-3xl font-mono">
                    {{ response?.data.filter((u: any) => u.role === 'admin').length || 0 }}
                </p>
            </div>
            <div class="bg-white space-y-2 p-10 rounded-xl w-full">
                <UIcon name="i-lucide-monitor-speaker" size="24" class="text-blue-500" />
                <p class="font-semibold text-gray">Kasir Aktif</p>
                <p class="font-bold text-3xl font-mono">
                    {{ response?.data.filter((u: any) => u.role === 'cashier').length || 0 }}
                </p>
            </div>
        </div>

        <UiTable 
            title="Semua List Pengguna"
            :columns="tableColumns" 
            :data="mappedUsers"
            :total-items="response?.count || 0" 
            :displayed-items="mappedUsers.length"
            :loading="pending"
            @sort="onTableSort"
        >
            <template #top-actions>
                <UiDropdownDefault class="ml-auto" v-model="limitParams" />
                
                <UiButton 
                    @click="executeExport"
                    :loading="isExporting"
                    :disabled="isExporting"
                    label="Export Excel" 
                    variant="export" 
                    color="gray" 
                    icon-name="i-lucide-upload" 
                />
            </template>
    
            <template #cell-no="{ index }">
                <span class="font-bold text-gray-800">{{ ((pageParams - 1) * limitParams) + index + 1 }}</span>
            </template>

            <template #header-username>
                <div class="flex items-center gap-2 cursor-pointer group" @click="handleSort('username')">
                    <span>Pengguna</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['username'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['username'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>
    
            <template #cell-username="{ row }">
                <div class="flex items-center gap-4">
                    <img :src="row.image" :alt="row.username" class="w-12 h-12 rounded-full shrink-0 object-cover border border-gray-200" />
                    <div class="flex flex-col">
                        <span class="font-bold text-black text-base">{{ row.username }}</span>
                    </div>
                </div>
            </template>

            <template #header-email>
                <div class="flex items-center gap-2 cursor-pointer group" @click="handleSort('email')">
                    <span>Pengguna</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon name="i-lucide-chevron-up" size="12" :class="activeSorts['email'] === 'asc' ? 'text-yellow-500' : 'text-gray-300'" />
                        <UIcon name="i-lucide-chevron-down" size="12" :class="activeSorts['email'] === 'desc' ? 'text-yellow-500' : 'text-gray-300'" />
                    </div>
                </div>
            </template>
    
            <template #cell-email="{ row }">
                <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                        <span class="font-bold text-black text-base">{{ row.email }}</span>
                    </div>
                </div>
            </template>
    
            <template #header-role>
                <div 
                    class="flex items-center gap-2 cursor-pointer group select-none" 
                    @click="toggleRoleFilter"
                >
                    <span>Peran</span>
                    <div class="flex flex-col -space-y-1">
                        <UIcon 
                            name="i-lucide-chevron-up" 
                            size="12" 
                            :class="roleParams === 'admin' ? 'text-yellow-500' : 'text-gray-300'" 
                        />
                        <UIcon 
                            name="i-lucide-chevron-down" 
                            size="12" 
                            :class="roleParams === 'cashier' ? 'text-yellow-500' : 'text-gray-300'" 
                        />
                    </div>

                    <span v-if="roleParams" class="text-[10px] font-normal text-yellow-600 capitalize">
                        : {{ roleParams }}
                    </span>
                </div>
            </template>
            
            <template #cell-role="{ row }">
                <UiLabel :text="row.role === 'admin' ? 'Admin' : 'Kasir'" :color="row.role === 'admin' ? 'blue' : 'gray'" class="capitalize" />
            </template>
    
            <template #cell-created_at="{ row }">
                <span class="font-semibold text-gray-600 text-sm">{{ row.created_at }}</span>
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