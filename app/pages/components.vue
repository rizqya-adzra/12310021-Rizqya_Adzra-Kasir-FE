<script setup lang="ts">
definePageMeta({
  layout: 'guest'
})

useHead({
  title: 'Components | Cashier App'
})
</script>

<template>
  <div>
    <LayoutNavbarUser layout="guest" />
    <LayoutNavbarUser layout="cashier" />
    <LayoutSidebarAdmin />
  </div>
  <div>
  </div>
</template>