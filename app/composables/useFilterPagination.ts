import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useFilterPagination() {
  const route = useRoute()
  const router = useRouter()

  const searchParams = ref(route.query.search?.toString() || '') 

  const categoryParams = ref(route.query.category?.toString() || '') 
  const visibilityParams = ref(route.query.visibility?.toString() || '') 
  const minPriceParams = ref(route.query.min_price?.toString() || '')
  const maxPriceParams = ref(route.query.max_price?.toString() || '')

  const roleParams = ref(route.query.role?.toString() || '')
  const isActiveParams = ref(route.query.is_active?.toString() || '')
  const isStaffParams = ref(route.query.is_staff?.toString() || '')

  const pageParams = ref(Number(route.query.page) || 1)
  const limitParams = ref(Number(route.query.limit) || 10) 

  const activeSorts = ref<Record<string, 'asc' | 'desc' | null>>({})

  const initOrdering = () => {
    const ordering = route.query.ordering?.toString()
    if (!ordering) return
    
    ordering.split(',').forEach(item => {
      const isDesc = item.startsWith('-')
      const key = isDesc ? item.substring(1) : item
      activeSorts.value[key] = isDesc ? 'desc' : 'asc'
    })
  }
  initOrdering()

 const handleSort = (key: string) => {
    const currentSort = activeSorts.value[key]
    activeSorts.value = {}
    if (!currentSort) {
      activeSorts.value[key] = 'asc'
    } else if (currentSort === 'asc') {
      activeSorts.value[key] = 'desc'
    }
    applyFilter(true)
  }
  
  const applyFilter = (resetPage = false) => {
    if (resetPage) pageParams.value = 1

    const query: Record<string, string | number | undefined> = {}
    
    if (searchParams.value) query.search = searchParams.value
    if (categoryParams.value) query.category = categoryParams.value
    if (visibilityParams.value) query.visibility = visibilityParams.value
    if (minPriceParams.value) query.min_price = minPriceParams.value
    if (maxPriceParams.value) query.max_price = maxPriceParams.value
    
    if (roleParams.value) query.role = roleParams.value
    if (isActiveParams.value) query.is_active = isActiveParams.value
    if (isStaffParams.value) query.is_staff = isStaffParams.value 
    
    if (pageParams.value > 1) query.page = pageParams.value
    if (limitParams.value !== 10) query.limit = limitParams.value 

    const orderingString = Object.entries(activeSorts.value)
      .map(([field, direction]) => (direction === 'desc' ? `-${field}` : field))
      .join(',')
    
    if (orderingString) query.ordering = orderingString

    router.push({ query })
  }

  const prevPage = () => { if (pageParams.value > 1) pageParams.value-- }
  const nextPage = (totalPages: number) => { if (pageParams.value < totalPages) pageParams.value++ }

  watch(
    [categoryParams, visibilityParams, roleParams, isActiveParams, isStaffParams, limitParams, minPriceParams, maxPriceParams], 
    () => {
      applyFilter(true) 
    }
  )

  watch(pageParams, () => {
    applyFilter(false)
  })

  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  watch(searchParams, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      applyFilter(true)
    }, 500) 
  })

  const apiQuery = computed(() => route.query)

  return {
    searchParams,
    categoryParams,
    visibilityParams,
    minPriceParams,
    maxPriceParams,
    roleParams,
    isActiveParams,
    isStaffParams,
    pageParams,
    limitParams,
    activeSorts, 
    handleSort,  
    apiQuery,
    prevPage,
    nextPage,
    applyFilter,
  }
}