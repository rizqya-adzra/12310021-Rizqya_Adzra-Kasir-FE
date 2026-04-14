<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
  class?: string
}

const props = withDefaults(defineProps<{
  title?: string
  columns: TableColumn[]
  data: any[]
  totalItems?: number
  displayedItems?: number
}>(), {
  title: '',
  totalItems: 0,
  displayedItems: 0
})
</script>

<template>
  <div class="bg-white rounded-3xl p-6 w-full">
    <div class="flex justify-between items-center mb-6">
      <h2 v-if="title" class="text-xl font-bold text-gold">{{ title }}</h2>
      
      <div v-if="data.length > 0" class="flex items-center gap-4">
        <slot name="top-actions"></slot>
      </div>
    </div>
    <div class="w-full overflow-x-auto pb-4">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr v-if="data.length > 0" class="bg-neutral text-gold font-bold text-sm">
            <th 
              v-for="col in columns" 
              :key="col.key" 
              class="p-4 py-5 first:rounded-l-2xl last:rounded-r-2xl cursor-pointer hover:bg-white transition-colors"
              :class="col.class"
              @click="$emit('sort', col.key)" 
            >
              <div class="flex items-center gap-2" :class="col.class?.includes('text-center') ? 'justify-center' : ''">
                <slot :name="'header-' + col.key" :column="col">
                  {{ col.label }}
                </slot>

              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, index) in data" 
            :key="index" 
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td 
              v-for="col in columns" 
              :key="col.key" 
              class="p-4 py-5 align-middle"
              :class="col.class"
            >
              <slot :name="'cell-' + col.key" :row="row" :index="index" :value="row[col.key]">
                <span class="text-gray-700 font-medium">{{ row[col.key] }}</span>
              </slot>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length" class="text-center py-10 text-gray-500 font-medium">
              Data tidak ditemukan
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="data.length > 0" class="flex flex-col md:flex-row justify-between items-center mt-4 bg-neutral p-4 rounded-2xl gap-4">
      <p class="text-sm text-gray-500 font-medium">
        Menampilkan {{ displayedItems }} dari {{ totalItems }} produk
      </p>
      <div class="flex items-center gap-1">
        <slot name="pagination"></slot>
      </div>
    </div>
  </div>
</template>