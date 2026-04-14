<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCategory } from '~/composables/api/useCategory'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  placeholder?: string
  error?: string
  icon?: string
}>(), {
  modelValue: '',
  label: '',
  placeholder: 'Pilih...',
  error: '',
  icon: ''
})

const emit = defineEmits(['update:modelValue'])

const { fetchCategories } = useCategory()
const { data: response, pending } = await fetchCategories()

const categories = computed(() => {
  return response.value?.data?.map(cat => ({
    id: cat.id,
    label: cat.name
  })) || []
})

const selected = ref()

const syncModelToSelected = (val: any) => {
  if (val && categories.value.length > 0) {
    const found = categories.value.find(c => c.id === val)
    selected.value = found
  } else {
    selected.value = undefined
  }
}

watch(() => props.modelValue, (newVal) => {
  syncModelToSelected(newVal)
}, { immediate: true })

watch(categories, () => {
  syncModelToSelected(props.modelValue)
})

watch(selected, (newObj) => {
  const newId = newObj?.id || ''
  if (newId !== props.modelValue) {
    emit('update:modelValue', newId)
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    
    <div class="flex items-center justify-between">
      <div v-if="label" class="flex justify-between items-end px-2">
        <label 
          class="font-bold text-sm md:text-base transition-colors duration-400"
          :class="error ? 'text-red-500' : 'text-gray'"
        >
          {{ label }}
        </label>
      </div>
  
      <span v-if="error" class="text-red-500 text-xs font-medium px-4 transition-all duration-400">
        {{ error }}
      </span>
    </div>

    <div class="relative w-full">
      <UIcon
        v-if="icon"
        :name="icon"
        class="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 size-4 md:size-6 transition-colors z-10 pointer-events-none"
        :class="error ? 'text-red-500' : 'text-black'"
      />

      <USelectMenu 
        v-model="selected" 
        :items="categories"
        trailing-icon=""
        variant="none"
        :disabled="pending"
        :ui="{
          content: 'bg-white/80 backdrop-blur-md ring-0 border-none rounded-xl md:rounded-3xl p-2 md:p-3 min-w-[100px] md:min-w-[120px] shadow z-50',
          input: 'hidden h-0 w-0 p-0 m-0 border-none', 
          item: 'p-0 cursor-pointer transition-transform duration-200 data-[highlighted]:bg-tertiary/5 p-4 rounded-3xl'
        }"
      >
        <template #default="{ open }">
          <button 
            type="button"
            :disabled="pending"
            :class="[
              'h-[60px] w-full rounded-md bg-[#EFF7F9] hover:ring-2 ring-primary text-sm md:text-base outline-none transition-all duration-400',
              'flex items-center justify-between text-left',
              icon ? 'pl-12 md:pl-16 pr-6' : 'px-6',
              pending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer focus:ring-primary focus:ring-2',
              error ? 'ring-2! ring-red-500! focus:ring-red-500! text-red-500!' : 'text-gray'
            ]"
          >
            <span class="truncate" :class="!selected ? 'text-gray-500' : 'text-gray'">
              {{ pending ? 'Memuat...' : (selected?.label || placeholder) }}
            </span>
            
            <div class="flex items-center ml-2 gap-2 shrink-0">
              <UIcon 
                v-if="selected && !pending"
                name="i-lucide-x" 
                class="size-5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer z-20" 
                @click.prevent.stop="selected = undefined"
              />
              <UIcon 
                v-if="!selected || pending"
                name="i-lucide-chevron-down" 
                :class="['size-5 text-gray transition-transform duration-200', open ? 'rotate-180' : '']" 
              />
            </div>
          </button>
        </template>

        <template #item="{ item }">
            <UiLabel 
              :text="item.label" 
              variant="solid" 
              class="my-2"
            />
        </template>
      </USelectMenu>
    </div>

  </div>
</template>