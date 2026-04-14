<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string | number
}>()

const emit = defineEmits(['update:modelValue'])

const pageSizes = [
  { id: 5, label: '5' as const },
  { id: 10, label: '10' as const },
  { id: 20, label: '20' as const },
  { id: 50, label: '50' as const },
]

const initialSize = pageSizes.find(p => p.id === Number(props.modelValue)) || pageSizes[0]
const selected = ref(initialSize)

watch(selected, (newValue) => {
  if (newValue) {
    emit('update:modelValue', newValue.id)
  }
})
</script>

<template>
  <div>
    <USelectMenu 
      v-model="selected" 
      :items="pageSizes"
      trailing-icon=""
      variant="none"
      :ui="{
        content: 'bg-gray/80 backdrop-blur-md ring-0 border-none rounded-[16px] md:rounded-2xl p-2 md:p-3 min-w-[100px] md:min-w-[120px]',
        input: 'hidden h-0 w-0 p-0 m-0 border-none', 
        item: 'hover:bg-transparent data-[highlighted]:bg-tertiary/5 justify-center p-2 cursor-pointer transition-colors rounded-lg md:rounded-xl'
      }"
    >
      <template #default="{ open }">
        <button 
          type="button"
          :class="[
            'rounded-md h-7 md:h-10 w-max px-6 font-bold text-sm bg-transparent text-gray border-2 border-gray flex items-center justify-center gap-2 md:gap-3 text-center select-none cursor-pointer transition-all duration-400',
            open ? 'bg-gray hover:text-black' : 'bg-transparent hover:bg-gray hover:text-white'
          ]"
        >
          <span class="hidden md:block md:text-sm font-semibold tracking-wide">Pagination</span>
          <span class="text-xs md:text-sm font-bold">{{ selected?.label }}</span>
        </button>
      </template>

      <template #item="{ item }">
        <span class="font-bold text-xs md:text-sm text-white text-center w-full">
          {{ item.label }}
        </span>
      </template>
    </USelectMenu>
  </div>
</template>