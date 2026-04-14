<template>
  <div class="max-w-480 min-h-screen mx-auto flex flex-col justify-start items-center gap-5 bg-neutral">
    <LayoutNavbarUser layout="cashier" />
    <div class="px-6 md:px-20 lg:px-64 my-0 md:my-5 w-full">
      <slot />
    </div>
  </div>
</template>