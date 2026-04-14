<template>
  <div class="min-h-screen flex w-full bg-neutral">
    <LayoutSidebarAdmin />
    <main class="flex-1 min-w-0 p-6 pt-20 lg:p-8 lg:pt-8">
      <div class="max-w-7xl mx-auto w-full">
        <slot />
      </div>
    </main>
  </div>
</template>