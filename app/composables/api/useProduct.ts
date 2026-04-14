import { useAuthStore } from '~/stores/useAuthStore'

export interface Product {
  id: string
  sku: string
  user: string
  category: string
  name: string
  description: string
  price: number
  stock: number
  minimal_stock: number
  image: string | null
  visibility: string
  is_low_stock: boolean
  created_at: string
  updated_at: string
}

export interface ProductResponse {
  success: boolean
  status_code: number
  message: string
  count: number
  data: Product[]
  current_page: number
  total_pages: number
}

export const useProduct = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getHeaders = () => {
    return {
      Authorization: `Token ${authStore.token}`,
      Accept: 'application/json',
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await $fetch('/products/list/', { 
        baseURL: config.public.apiBase,
        headers: getHeaders(),
      })
      
      return { data: { value: response } } 
    } catch (error) {
      console.error('Gagal fetch products', error)
      throw error
    }
  }

  const fetchProductNew = async (queryParams?: any) => {
    return useFetch<{ success: boolean; data: Product }>(`/products/list/`, {
      key: `product-list`,
      baseURL: config.public.apiBase,
      headers: getHeaders(),
      query: queryParams,
    })
  }

  const fetchProductDetail = async (id: string) => {
    return useFetch<{ success: boolean; data: Product }>(`/products/list/detail/${id}/`, {
      key: `product-detail-${id}`,
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const createProduct = async (formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch('/products/list/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to create product:', error)
      throw error
    }
  }

  const updateProduct = async (id: string, formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch(`/products/list/detail/${id}/`, {
        baseURL: config.public.apiBase,
        method: 'PUT',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to update product:', error)
      throw error
    }
  }

  const addStockToProduct = async (id: string, payload: { amount: number }) => {
    try {
      const response = await $fetch(`/products/${id}/add-stock/`, {
        baseURL: config.public.apiBase,
        method: 'PATCH',
        headers: getHeaders(),
        body: payload,
      })
      return response
    } catch (error) {
      console.error('Failed to update product:', error)
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const response = await $fetch(`/products/list/detail/${id}/`, {
        baseURL: config.public.apiBase,
        method: 'DELETE',
        headers: getHeaders(),
      })
      return response
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw error
    }
  }

  const exportProductsExcel = async (queryParams?: any) => {
    try {
      const response = await $fetch<Blob>('/products/list/', {
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
    fetchProducts,
    fetchProductNew,
    fetchProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    exportProductsExcel,
    addStockToProduct,
  }
}