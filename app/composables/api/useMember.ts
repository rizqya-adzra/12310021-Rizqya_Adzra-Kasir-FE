import { useAuthStore } from '~/stores/useAuthStore'

export interface Member {
  id: string
  telephone: string
  name: string
  point: number
  created_at: string
  updated_at: string
}

export interface MemberResponse {
  success: boolean
  status_code: number
  message: string
  count: number
  data: Member[]
  current_page: number
  total_pages: number
}

export const useMember = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getHeaders = () => {
    return {
      Authorization: `Token ${authStore.token}`,
      Accept: 'application/json',
    }
  }

  const fetchMembers = async () => {
    return useFetch<MemberResponse>('/transactions/members/', {
      key: 'members-list',
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const fetchMemberDetail = async (id: string) => {
    return useFetch<{ success: boolean; data: Member }>(`/transactions/members/detail/${id}/`, {
      key: `member-detail-${id}`,
      baseURL: config.public.apiBase,
      headers: getHeaders(),
    })
  }

  const createMember = async (formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch('/transactions/members/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to create member:', error)
      throw error
    }
  }

  const updateMember = async (id: string, formData: FormData | Record<string, any>) => {
    try {
      const response = await $fetch(`/transactions/members/detail/${id}/`, {
        baseURL: config.public.apiBase,
        method: 'PUT',
        headers: getHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      console.error('Failed to update member:', error)
      throw error
    }
  }

  const deleteMember = async (id: string) => {
    try {
      const response = await $fetch(`/transactions/members/detail/${id}/`, {
        baseURL: config.public.apiBase,
        method: 'DELETE',
        headers: getHeaders(),
      })
      return response
    } catch (error) {
      console.error('Failed to delete member:', error)
      throw error
    }
  }

  return {
    fetchMembers,
    fetchMemberDetail,
    createMember,
    updateMember,
    deleteMember,
  }
}