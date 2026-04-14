<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  isActive?: boolean
}>(), {
  isActive: false
})

const classes = computed(() => [
  'px-4 py-2 rounded',
  'font-bold text-gray-500 hover:bg-secondary/10 hover:text-black text-sm',
  'transition-all duration-200 cursor-pointer',
  
  props.isActive ? 'text-gray' : 'bg-transparent hover:bg-gray-100'
])
</script>

<template>
  <button :class="classes">
    <span class="leading-none py-2">{{ label }}</span>
  </button>
</template>