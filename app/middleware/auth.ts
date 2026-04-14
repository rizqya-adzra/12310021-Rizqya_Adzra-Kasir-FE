export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  const token = authStore.token
  const role = authStore.role || useCookie('role').value

  if (!token) {
    const publicPages = ['/login', '/']
    if (!publicPages.includes(to.path)) {
      return navigateTo('/login')
    }
    return
  }

  if (token) {
    if (['/login', '/'].includes(to.path)) {
      return role === 'admin' ? navigateTo('/admin/dashboard') : navigateTo('/cashier/dashboard')
    }

    if (to.path.startsWith('/admin') && role !== 'admin') {
      return navigateTo('/cashier/dashboard') 
    }

    if (to.path.startsWith('/cashier') && role !== 'cashier') {
      return navigateTo('/admin/dashboard')
    }
  }
})