import { useAuthStore } from '~/stores/useAuthStore'

export interface CategoryDetail {
  id: string
  name: string
  description: string
}

export interface CategoryResponse {
  success: boolean
  status_code: number
  message: string
  count: number
  data: CategoryDetail[]
}

export const useCategory = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getHeaders = () => {
    return {
      Authorization: `Token ${authStore.token}`,
      Accept: 'application/json',
    }
  }

  const fetchCategories = async () => {
    return useFetch<CategoryResponse>('/products/categories/', {
      key: 'categories-list',
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const fetchCategoryDetail = async (id: string) => {
      return useFetch<{ success: boolean; data: CategoryResponse }>(`/products/categories/${id}/`, { 
        key: `Category-detail-${id}`,
        baseURL: config.public.apiBase,
        headers: getHeaders(),
      })
    }
  
    const createCategory = async (formData: FormData | Record<string, any>) => {
      try {
        const response = await $fetch('/products/categories/', {
          baseURL: config.public.apiBase,
          method: 'POST',
          headers: getHeaders(),
          body: formData,
        })
        return response
      } catch (error) {
        console.error('Failed to create Category:', error)
        throw error
      }
    }
  
    const updateCategory = async (id: string, formData: FormData | Record<string, any>) => {
      try {
        const response = await $fetch(`/products/categories/${id}/`, {
          baseURL: config.public.apiBase,
          method: 'PUT',
          headers: getHeaders(),
          body: formData,
        })
        return response
      } catch (error) {
        console.error('Failed to update Category:', error)
        throw error
      }
    }
  
    const deleteCategory = async (id: string) => {
      try {
        const response = await $fetch(`/products/categories/${id}/`, {
          baseURL: config.public.apiBase,
          method: 'DELETE',
          headers: getHeaders(),
        })
        return response
      } catch (error) {
        console.error('Failed to delete Category:', error)
        throw error
      }
    }

    const exportCategoryExcel = async (queryParams?: any) => {
    try {
      const response = await $fetch<Blob>('/products/categories/', {
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
    fetchCategories,
    fetchCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory,
    exportCategoryExcel,
  }
}