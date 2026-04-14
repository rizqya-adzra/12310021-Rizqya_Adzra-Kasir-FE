import { useAuthStore } from '~/stores/useAuthStore'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  return {
    authStore,
    router,
  }
}