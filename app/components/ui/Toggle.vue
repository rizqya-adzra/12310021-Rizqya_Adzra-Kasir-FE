<script setup lang="ts">
import { useId } from '#imports'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  disabled?: boolean
}>(), {
  modelValue: false,
  label: 'Label',
  disabled: false,
})

const emit = defineEmits(['update:modelValue'])

const id = useId()
</script>

<template>
  <div 
    class="w-full flex items-center justify-between font-sans transition-all duration-300"
    :class="{ 'opacity-50': disabled }"
  >
    
    <label 
      :for="id" 
      class="font-bold text-gray text-sm md:text-base whitespace-nowrap mr-6"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
    >
      {{ label }}
    </label>

    <div class="relative flex items-center">
      <input
        :id="id"
        type="checkbox"
        class="peer sr-only"
        :checked="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />

      <div 
        class="w-14 h-7 rounded-full transition-colors duration-300 ease-in-out peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400 peer-focus-visible:ring-offset-2"
        :class="[
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          modelValue ? 'bg-secondary' : 'bg-[#EFF7F9]'
        ]"
        @click="!disabled && $emit('update:modelValue', !modelValue)"
      >
        <div 
          class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow-sm"
          :class="modelValue ? 'translate-x-7 bg-white' : 'translate-x-0 bg-[#D4D4D8]'"
        ></div>
      </div>
    </div>

  </div>
</template>