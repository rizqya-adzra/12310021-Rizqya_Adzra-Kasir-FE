<script setup lang="ts">
import { computed } from 'vue'

type LabelVariant = 'solid' | 'outline'

const props = withDefaults(defineProps<{
  text: string 
  variant?: LabelVariant
}>(), {
  variant: 'solid'
})

const categoryColors: Record<string, string> = {
  'Food & Beverages': 'bg-[#FFA7C7] text-[#890022]', 
  'Rumah Tangga': 'bg-[#E2F58B] text-[#895E00]',    
  'Bayi & Anak': 'bg-[#DFA7FF] text-[#820089]',      
  'Kesehatan': 'bg-[#A7FFA7] text-[#208900] text-[#208900]',        
  'Skincare': 'bg-[#A7DAFF] text-[#005089]',         
}

const statusStyles: Record<string, { bg: string }> = {
  'active': { bg: 'bg-white' },
  'draft': { bg: 'bg-white' },
  'admin only': { bg: 'bg-white' },
}

const classes = computed(() => {
  const base = 'px-4 py-1.5 font-bold text-xs md:text-sm inline-flex items-center justify-center whitespace-nowrap rounded-full'
  
  const key = props.text 

  if (props.variant === 'solid') {
    const colorClass = categoryColors[key] || 'bg-gray-500 text-white'
    return [base, colorClass]
  } else {
    const style = statusStyles[key] || { bg: 'bg-gray-100'}
    return [base, 'border-2', style.bg]
  }
})
</script>

<template>
  <span :class="classes">
    <span v-if="variant === 'outline'" class="w-2.5 h-2.5 rounded-full mr-2 bg-current shrink-0"></span>
    
    {{ text }}
  </span>
</template>