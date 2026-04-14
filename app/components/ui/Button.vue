<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'export' | 'big' | 'outline' | 'square' | 'chip'
type ButtonColor = 'yellow' | 'blue' | 'gray' | 'transparent' | 'ghost'

const props = withDefaults(defineProps<{
  label?: string 
  variant?: ButtonVariant
  color?: ButtonColor
  showIcon?: boolean
  iconName?: string 
}>(), {
  label: '', 
  variant: 'primary',
  color: 'yellow',
  showIcon: true
})

const colorVariants: Record<ButtonColor, string> = {
  yellow: 'bg-primary hover:bg-primary/70 text-black',
  blue: 'bg-secondary hover:bg-secondary/70 text-black',
  gray: 'bg-gray hover:bg-gray/70 text-white',
  transparent: 'bg-transparent hover:bg-gray border-2 border-gray hover:text-white',
  ghost: 'bg-transparent text-gray hover:bg-gray/10 font-bold' 
}

const sizeVariants: Record<ButtonVariant, string> = {
  primary: 'h-[28px] md:h-[40px] w-max px-6 font-bold text-sm', 
  big: 'h-[28px] md:h-[64px] w-full rounded-full px-6 md:px-0 font-bold text-md md:text-lg',
  export: 'h-[28px] md:h-[40px] w-max px-6 font-semibold text-sm group text-white',
  outline: 'h-[28px] md:h-[40px] w-max px-6 font-bold text-sm text-gray',
  square: 'size-[18px] md:size-[30px] !p-0 font-bold text-md rounded-md',
  chip: 'h-[28px] md:h-[40px] w-max px-6 font-semibold text-sm text-gray'
}

const currentIcon = computed(() => {
  if (props.iconName) return props.iconName
  if (props.variant === 'square' || props.variant === 'chip') return '' 
  return props.variant === 'export' ? 'i-lucide-upload' : 'i-lucide-arrow-right'
})

const iconClasses = computed(() => {
  if (props.variant === 'square') {
    return 'size-4 md:size-5 shrink-0'
  }
  if (props.variant === 'export') {
    return 'size-3 md:size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5'
  }
  return 'size-4 md:size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1'
})

const classes = computed(() => {
  let radiusClass = 'rounded-md'
  if (props.variant === 'square') radiusClass = '' 
  if (props.variant === 'chip') radiusClass = 'rounded-full'

  return [
    'flex items-center justify-center gap-2 md:gap-3',
    'text-center select-none cursor-pointer',
    'transition-all duration-400',
    
    radiusClass,
    sizeVariants[props.variant],
    colorVariants[props.color]
  ]
})
</script>

<template>
  <UButton :class="classes">
    <span v-if="label" class="leading-none pt-0.5 whitespace-nowrap">{{ label }}</span>
    <UIcon 
      v-if="showIcon && currentIcon" 
      :name="currentIcon" 
      :class="iconClasses"
    />
  </UButton>
</template>