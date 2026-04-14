<script setup lang="ts">
import { computed, toRefs, ref } from 'vue'
import { usePriceFormatter } from '~/composables/usePriceFormatter' 

type InputVariant = 'default' | 'search'
type InputColor = 'default' | 'white'
type DataType = 'string' | 'integer'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  variant?: InputVariant
  color?: InputColor
  dataType?: DataType 
  prefix?: string
  icon?: string 
  error?: string
}>(), {
  modelValue: '',
  type: 'text',
  variant: 'default',
  color: 'default',
  dataType: 'string', 
  error: '',
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

const inputVariants: Record<InputVariant, string> = {
  default: [
    'h-[60px] w-full rounded-md px-6',
    'bg-[#EFF7F9] hover:ring-2 ring-primary text-gray text-sm md:text-base',
    'focus:ring-primary focus:ring-2 focus:ring-primary',
    'placeholder:text-gray-500 outline-none transition-all duration-400'
  ].join(' '),
  
  search: [
    'h-[48px] md:h-[64px] w-full rounded-xl pl-12 md:pl-16 pr-4 md:pr-6', 
    'bg-white hover:ring-2 ring-primary text-gray text-sm md:text-base',
    'focus:ring-primary focus:ring-2 focus:ring-primary', 
    'placeholder:text-gray-500 outline-none transition-all duration-400'
  ].join(' '),
}

const InputColor = {
  default: '',
  white: 'bg-white',
}

const paddingClass = computed(() => {
  if (props.icon && props.prefix) return '!pl-20 md:!pl-24' 
  if (props.icon) return '!pl-12 md:!pl-16'                
  if (props.prefix) return '!pl-12 md:!pl-16'              
  return ''
})

const actualInputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type === 'number' ? 'text' : props.type
})

const { modelValue, dataType } = toRefs(props)

const { displayValue, onInput } = usePriceFormatter(
  modelValue, 
  dataType, 
  (val) => emit('update:modelValue', val)
)
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    
    <div class="flex items-center justify-between">
      <div v-if="variant === 'default' && label" class="flex justify-between items-end px-2">
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
        class="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 size-4 md:size-6 transition-colors z-10"
        :class="error ? 'text-red-500' : 'text-black'"
      />

      <span 
        v-if="prefix" 
        class="absolute top-1/2 -translate-y-1/2 font-medium z-10 pointer-events-none"
        :class="[
          icon ? 'left-10 md:left-14' : 'left-4 md:left-6', 
          error ? 'text-red-500' : 'text-gray-500'
        ]"
      >
        {{ prefix }}
      </span>

      <textarea
        v-if="type === 'textarea'"
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder"
        rows="4"
        :class="[
          inputVariants[variant],
          InputColor[color],
          paddingClass,
          'h-auto py-4 resize-y min-h-30',
          error ? 'ring-2! ring-red-500! focus:ring-red-500! focus:ring-red-500! text-red-500! placeholder:text-red-400!' : ''
        ]"
      ></textarea>
      
      <input
      v-else
        :type="actualInputType" 
        :value="displayValue"
        @input="onInput"
        :placeholder="placeholder"
        :class="[
          inputVariants[variant],
          InputColor[color],
          paddingClass,
          type === 'password' ? 'pr-12! md:pr-14!' : '', 
          error ? 'ring-2! ring-red-500! focus:ring-red-500! focus:ring-red-500! text-red-500! placeholder:text-red-400!' : ''
        ]"
      />
      
      <button
        v-if="type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center z-10 transition-colors"
      >
        <UIcon 
          :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" 
          class="size-5" 
        />
      </button>
    </div>

  </div>
</template>

<style scoped>
input::-ms-reveal,
input::-ms-clear {
  display: none;
}

input::-webkit-credentials-auto-fill-button {
  visibility: hidden;
  position: absolute;
  right: 0;
}
</style>