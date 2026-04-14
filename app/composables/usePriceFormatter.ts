import { computed, type Ref } from 'vue'

export function usePriceFormatter(
  modelValue?: Ref<string | number | undefined>,
  dataType?: Ref<'string' | 'integer'>,
  onUpdate?: (value: string | number) => void
) {
  
  const formatRupiah = (val: string | number | undefined) => {
    if (val === '' || val === undefined || val === null) return ''
    
    const numStr = String(val).replace(/\D/g, '')
    if (!numStr) return ''
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(numStr))
  }

  const formatDot = (val: string | number | undefined) => {
    if (val === '' || val === undefined || val === null) return ''
    
    const numStr = String(val).replace(/\D/g, '')
    if (!numStr) return ''
    
    return new Intl.NumberFormat('id-ID').format(Number(numStr)) 
  }

  const displayValue = computed(() => {
    if (dataType?.value === 'integer') {
      return formatDot(modelValue?.value)
    }
    return modelValue?.value
  })

  const onInput = (event: Event) => {
    if (!onUpdate) return
    const target = event.target as HTMLInputElement
    const rawValue = target.value

    if (dataType?.value === 'integer') {
      const numericString = rawValue.replace(/\D/g, '')
      const numericValue = numericString ? parseInt(numericString, 10) : ''
      
      onUpdate(numericValue)
      
      target.value = formatDot(numericString)
    } else {
      onUpdate(rawValue)
    }
  }

  return {
    displayValue,
    onInput,
    formatRupiah,
    formatDot 
  }
}