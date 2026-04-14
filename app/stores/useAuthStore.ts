import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'cashier'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string>
}

interface User {
  email: string
  image?: string | null
  // is_staff: boolean
  created_at?: string
  role: UserRole
  [key: string]: any 
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const tokenCookie = useCookie<string | null>('token')
    // const isStaffCookie = useCookie<string | boolean | null>('is_staff')
    const roleCookie = useCookie<UserRole | null>('role')

    // const isStaffVal = isStaffCookie.value === 'true' || isStaffCookie.value === true || false

    return {
      user: null as User | null,
      token: tokenCookie.value || null,
      // isStaff: isStaffVal,
      role: (roleCookie.value) as UserRole | null,
      // role: (roleCookie.value || ('admin' ? 'cashier')) as UserRole | null,
      loading: false,
      message: null as string | null,
      error: null as string | null,
      validationErrors: {} as Record<string, string>,
    }
  },

  actions: {
    async login(payload: any) { 
      this.loading = true
      this.message = null
      this.error = null
      this.validationErrors = {} 
      
      const config = useRuntimeConfig()
      
      try {
        const response = await $fetch<ApiResponse>(`${config.public.apiBase}/auth/login/`, {
          method: 'POST',
          body: payload, 
        })

        if (response.success && response.data) {
            const calculatedRole: UserRole = response.data.role || (response.data.is_staff ? 'admin' : 'cashier')

            this.token = response.data.token
            // this.isStaff = response.data.is_staff
            this.role = calculatedRole
            
            this.user = { 
              email: response.data.email,
              image: response.data.image,
              // is_staff: response.data.is_staff,
              created_at: response.data.created_at,
              role: calculatedRole
            } 
            
            useCookie('token').value = response.data.token
            useCookie('is_staff').value = response.data.is_staff.toString()
            useCookie('role').value = calculatedRole // Sekarang ini pasti berisi string, bukan undefined

            return response 
        }
      } catch (err: any) {
        const apiResponse = err.data as ApiResponse 
        const errorMsg = apiResponse?.message || 'Gagal login ke server'
        this.message = errorMsg
        this.error = errorMsg 
        if (apiResponse?.errors) this.validationErrors = apiResponse.errors
        throw apiResponse 
      } finally {
        this.loading = false
      }
    },

    async register(payload: any) {
      this.loading = true
      this.message = null
      this.error = null
      this.validationErrors = {}
      
      const config = useRuntimeConfig()
      
      try {
        const response = await $fetch<ApiResponse>(`${config.public.apiBase}/auth/register/`, {
          method: 'POST',
          body: payload,
        })

        if (response.success && response.data) {
          const calculatedRole: UserRole = response.data.role || (response.data.is_staff ? 'admin' : 'cashier')

          this.token = response.data.token
          // this.isStaff = response.data.is_staff
          this.role = calculatedRole

          this.user = { 
            email: response.data.email,
            image: response.data.image,
            is_staff: response.data.is_staff,
            created_at: response.data.created_at,
            role: calculatedRole
          }

          useCookie('token').value = response.data.token
          useCookie('is_staff').value = response.data.is_staff?.toString()
          useCookie('role').value = calculatedRole

          return response
        }
      } catch (err: any) {
        const apiResponse = err.data || {}
        const errorMsg = apiResponse?.message || err.statusMessage || 'Registrasi gagal'
        this.message = errorMsg
        this.error = errorMsg
        this.validationErrors = apiResponse?.errors || {}
        throw { success: false, message: errorMsg, errors: apiResponse?.errors || {} }
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      if (!this.token) return null

      this.loading = true
      this.error = null
      const config = useRuntimeConfig()

      try {
        const response = await $fetch<ApiResponse>(`${config.public.apiBase}/profile/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${this.token}`, 
            Accept: 'application/json',
          } 
        })

        if (response.success && response.data) {
          const userData = { ...response.data }
          
          if (userData.profile) {
             Object.assign(userData, userData.profile)
             delete userData.profile
          }

          if (userData.is_staff !== undefined) {
            // this.isStaff = userData.is_staff
            useCookie('is_staff').value = userData.is_staff.toString()
          }

          const calculatedRole: UserRole = userData.role
          // const calculatedRole: UserRole = userData.role || (this.isStaff ? 'admin' : 'cashier')
          this.role = calculatedRole
          useCookie('role').value = calculatedRole
          
          this.user = { ...this.user, ...userData, role: calculatedRole } as User

          return response
        }
      } catch (err: any) {
        const apiResponse = err.data || {}
        this.error = apiResponse?.message || 'Gagal mengambil data profil'
        throw apiResponse
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      const config = useRuntimeConfig()

      try {
        await $fetch(`${config.public.apiBase}/auth/logout/`, {
          method: 'POST',
          headers: { Authorization: `Token ${this.token}` }
        })
      } catch (error: any) {
        console.warn('Logout failed on server (token expired?):', error.message)
      } finally {
        this.user = null
        this.token = null
        // this.isStaff = false
        this.role = null
        this.validationErrors = {}
        this.error = null

        useCookie('token').value = null
        useCookie('is_staff').value = null
        useCookie('role').value = null
        
        this.loading = false

        return navigateTo('/login')
      }
    }
  }
})