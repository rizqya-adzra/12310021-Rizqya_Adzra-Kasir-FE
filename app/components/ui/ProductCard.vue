<script setup lang="ts">
import { computed } from 'vue'
import defaultImage from '~/assets/images/default_image.jpg'


interface Product {
  id: string
  image: string
  name: string
  category: string
  price: number
  stock: number 
}

const props = defineProps({
  product: {
    type: Object as () => Product,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isDisabled: { 
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-selected'])

const cardClasses = computed(() => [
  'flex',
  'flex-col',
  'bg-white',
  'rounded-xl',
  'p-4',
  'transition-all',
  'duration-400',
  'ease-in-out',
  'w-full',
  'max-w-[280px]', 
  'h-full',        
  'max-h-[400px]',
  props.isSelected || props.isDisabled ? 'opacity-40' : 'opacity-100',
  props.isDisabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
])

const imageClasses = computed(() => [
  'w-full',
  'h-[200px]',     
  'object-cover', 
  'rounded-lg',
  props.isDisabled ? 'grayscale' : '' 
])

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(props.product.price)
})

const toggleSelection = () => {
  if (props.isDisabled) return 
  emit('toggle-selected', props.product)
}
</script>

<template>
  <div :class="cardClasses">
    <div class="overflow-hidden rounded-lg mb-3 shrink-0 relative">
      <img :src="product.image || defaultImage" :alt="product.name" :class="imageClasses" />
      <div v-if="isDisabled" class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
        Stok Habis
      </div>
    </div>

    <div class="mb-2 flex justify-between items-center">
      <UiLabel :text="product.category" />
      <span class="text-xs font-bold text-gray-500">Stok: {{ product.stock }}</span>
    </div>

    <h3 class="font-extrabold text-tertiary mb-1 line-clamp-2" :title="product.name">
      {{ product.name }}
    </h3>
    
    <p class="font-extrabold text-gold mb-4">{{ formattedPrice }}</p>

    <UiButton 
      v-if="isSelected" 
      variant="chip" 
      color="gray" 
      icon-name="i-lucide-minus-circle"
      label="Terpilih" 
      @click="toggleSelection" 
      />
      <UiButton 
      v-else 
      :disabled="isDisabled"
      variant="chip" 
      color="ghost" 
      icon-name="i-lucide-plus-circle"
      :label="isDisabled ? 'Habis' : 'Tambah'" 
      @click="toggleSelection" 
    />
  </div>
</template>