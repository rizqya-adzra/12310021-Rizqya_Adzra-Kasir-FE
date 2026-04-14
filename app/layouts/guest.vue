<template>
  <div class="max-w-480 min-h-screen mx-auto flex flex-col justify-start items-center gap-5 bg-neutral">
    <LayoutNavbarUser layout="guest" />
    <div class="w-full">
      <slot />
    </div>
  </div>
</template>