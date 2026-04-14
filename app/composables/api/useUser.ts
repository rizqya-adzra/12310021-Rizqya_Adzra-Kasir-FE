import { useAuthStore } from '~/stores/useAuthStore'

export type UserRole = 'admin' | 'cashier'

export interface User {
  username: string
  email: string
  image: string | null
  is_staff: boolean
  created_at: string
  role: UserRole
}

export interface UserResponse {
  success: boolean
  status_code: number
  message: string
  count: number
  data: User[]
  current_page: number
  total_pages: number
}

export const useUser = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getHeaders = () => {
    return {
      Authorization: `Token ${authStore.token}`,
      Accept: 'application/json',
    }
  }

  const fetchUsers = async (queryParams?: any) => {
    return useFetch<UserResponse>('/users/', {
      key: 'users-list',
      query: queryParams,
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const fetchUserDetail = async (email: string) => {
    return useFetch<{ success: boolean; data: User }>(`/users/${email}/`, { 
      key: `user-detail-${email}`,
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const createUser = async (formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch('/users/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  const updateUser = async (email: string, formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch(`/users/${email}/`, {
        baseURL: config.public.apiBase,
        method: 'PATCH',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  const deleteUser = async (email: string) => {
    try {
      const response = await $fetch(`/users/${email}/`, {
        baseURL: config.public.apiBase,
        method: 'DELETE',
        headers: getHeaders(),
      })
      return response
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  const exportUsersExcel = async (queryParams?: any) => {
    try {
      const response = await $fetch<Blob>('/users/', {
        baseURL: config.public.apiBase,
        headers: getHeaders(),
        query: { ...queryParams, export: 'excel' }, 
        responseType: 'blob', 
      })
      return response
    } catch (error) {
      console.error('Gagal mengekspor data:', error)
      throw error
    }
  }


  return {
    fetchUsers,
    fetchUserDetail,
    createUser,
    updateUser,
    deleteUser,
    exportUsersExcel,
  }
}