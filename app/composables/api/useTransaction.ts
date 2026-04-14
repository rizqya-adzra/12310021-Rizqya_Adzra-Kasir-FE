import { useAuthStore } from '~/stores/useAuthStore'

export interface TransactionDetail {
  id: string
  product: string
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Transaction {
  id: string
  invoice: string
  user: string
  username: string
  is_member: boolean
  member: string | null
  telephone: string
  customer_name: string
  payment_amount: number
  change_amount: number
  subtotal: number
  is_point: boolean
  point: number
  total: number
  total_quantity: number
  created_at: string
  details: TransactionDetail[]
}

export interface TransactionResponse {
  success: boolean
  status_code: number
  message: string
  count: number
  data: Transaction[]
  current_page: number
  total_pages: number
}

export const useTransaction = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getHeaders = () => {
    return {
      Authorization: `Token ${authStore.token}`,
      Accept: 'application/json',
    }
  }

  const fetchTransactions = async (queryParams?: any) => {
    return useFetch<TransactionResponse>('/transactions/', {
      key: 'transactions-list',
      query: queryParams,
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const fetchTransactionDetail = async (id: string) => {
    return useFetch<{ success: boolean; data: Transaction }>(`/transactions/${id}/`, {
      key: `transaction-detail-${id}`,
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const createTransaction = async (formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch('/transactions/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to create transaction:', error)
      throw error
    }
  }

  const updateTransaction = async (id: string, formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch(`/transactions/${id}/`, {
        baseURL: config.public.apiBase,
        method: 'PUT',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to update transaction:', error)
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await $fetch(`/transactions/${id}/`, {
        baseURL: config.public.apiBase,
        method: 'DELETE',
        headers: getHeaders(),
      })
      return response
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  }

  const exportTransactionPDF = async (id: string) => {
    try {
      const response = await $fetch<Blob>(`/transactions/${id}/`, {
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Token ${authStore.token}` 
        },
        query: { export: 'pdf' }, 
        responseType: 'blob', 
      })
      return response
    } catch (error) {
      console.error('Gagal mengekspor PDF:', error)
      throw error
    }
  }

  return {
    fetchTransactions,
    fetchTransactionDetail,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    exportTransactionPDF,
  }
}