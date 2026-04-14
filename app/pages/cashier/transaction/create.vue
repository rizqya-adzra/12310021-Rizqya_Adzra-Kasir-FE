<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue' // Tambahkan watch
import defaultImage from '~/assets/images/default_image.jpg'

import { useProduct, type Product } from '~/composables/api/useProduct'
import { useTransaction } from '~/composables/api/useTransaction'
import { useMember, type Member } from '~/composables/api/useMember'

definePageMeta({
  middleware: 'auth',
  layout: 'cashier'
})

const { fetchProducts } = useProduct()
const { createTransaction } = useTransaction()
const { fetchMembers } = useMember()

const searchParams = ref('')
const productsList = ref<Product[]>([])
const membersList = ref<Member[]>([])

const isTransactionOpen = ref(false)
const cart = ref<CartItem[]>([])

const errors = ref({
  payment_amount: '',
  points_used: '',
  general: ''
})

interface CartItem {
  product: Product
  quantity: number
}

const form = ref({
  is_member: false,
  telephone: '',
  customer_name: '',
  payment_amount: 0,
  use_point: false,
  points_used: 0,
})

const availablePoints = ref(0)

const loadProducts = async () => {
  try {
    const { data } = await fetchProducts()
    if (data.value && data.value.success) {
      productsList.value = data.value.data
    }
  } catch (error) {
    console.error('Gagal mengambil produk', error)
  }
}

const loadMembers = async () => {
  try {
    const { data } = await fetchMembers()
    if (data.value && data.value.success) {
      membersList.value = data.value.data
    }
  } catch (error) {
    console.error('Gagal mengambil daftar member', error)
  }
}

onMounted(() => {
  loadProducts()
  loadMembers()
})

const currentMember = computed(() => {
  if (!form.value.is_member || !form.value.telephone) return null
  return membersList.value.find(m => m.telephone === form.value.telephone) || null
})

watch(currentMember, (member) => {
  if (member) {
    form.value.customer_name = member.name
    availablePoints.value = member.point
  } else {
    availablePoints.value = 0
    form.value.use_point = false
    form.value.points_used = 0
  }
})

watch(() => form.value.is_member, (isMember) => {
  if (!isMember) {
    form.value.telephone = ''
    form.value.use_point = false
    form.value.points_used = 0
  }
})

const addToCart = (product: Product) => {
  if (product.stock <= 0) return 

  const existingItemIndex = cart.value.findIndex(item => item.product.id === product.id)
  
  if (existingItemIndex !== -1) {
    cart.value.splice(existingItemIndex, 1)
    if (cart.value.length === 0) isTransactionOpen.value = false
  } else {
    cart.value.push({ product, quantity: 1 })
  }
}

const incrementQty = (item: CartItem) => {
  if (item.quantity < item.product.stock) {
    item.quantity++
  } else {
    console.log('Maksimal stok tercapai')
  }
}

const decrementQty = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    removeFromCart(item)
  }
}

const removeFromCart = (item: CartItem) => {
  cart.value = cart.value.filter(i => i.product.id !== item.product.id)
  if (cart.value.length === 0) {
    isTransactionOpen.value = false
  }
}

const filteredProducts = computed(() => {
  if (!searchParams.value) return productsList.value
  return productsList.value.filter(p => 
    p.name.toLowerCase().includes(searchParams.value.toLowerCase())
  )
})

const cartSubtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
})

// --- TAMBAHAN: Otomatis matikan toggle poin jika kasir mengurangi barang & subtotal turun ---
watch(cartSubtotal, (newSubtotal) => {
  if (newSubtotal <= 20000 && form.value.use_point) {
    form.value.use_point = false
    form.value.points_used = 0
  }
})
// -----------------------------------------------------------------------------------------

const totalQuantity = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0)
})

const finalTotal = computed(() => {
  let total = cartSubtotal.value
  if (form.value.use_point && form.value.points_used) {
    total -= form.value.points_used
  }
  return Math.max(total, 0)
})

const changeAmount = computed(() => {
  if (!form.value.payment_amount) return 0
  return Math.max(form.value.payment_amount - finalTotal.value, 0)
})

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const handleCheckout = async () => {
  errors.value = { payment_amount: '', points_used: '', general: '' }

  if (cart.value.length === 0) {
    errors.value.general = "Keranjang masih kosong! Pilih produk terlebih dahulu."
    return
  }
  
  if (form.value.payment_amount < finalTotal.value) {
    errors.value.payment_amount = "Nominal uang pembayaran kurang dari total tagihan!"
    return
  }

  // --- TAMBAHAN: Validasi poin saat checkout ---
  if (form.value.use_point) {
    if (cartSubtotal.value <= 20000) {
      errors.value.general = "Poin hanya dapat digunakan jika total belanja di atas Rp 20.000."
      return
    }
    if (form.value.points_used > availablePoints.value) {
      errors.value.points_used = "Poin yang dimasukkan melebihi batas!"
      return
    }
  }
  // ---------------------------------------------

  const payload = {
    is_member: form.value.is_member,
    telephone: form.value.is_member ? form.value.telephone : null,
    customer_name: form.value.customer_name,
    payment_amount: form.value.payment_amount,
    change_amount: changeAmount.value,
    subtotal: cartSubtotal.value,
    is_point: form.value.use_point,
    point: form.value.use_point ? form.value.points_used : 0,
    total: finalTotal.value,
    total_quantity: totalQuantity.value,
    details: cart.value.map(item => ({
      product: item.product.id,
      product_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }))
  }

  try {
    const response = await createTransaction(payload)
    alert("Transaksi berhasil!")
    const transactionId = response?.data?.id || response?.id
    
    cart.value = []
    form.value = {
      is_member: false,
      telephone: '',
      customer_name: '',
      payment_amount: 0,
      use_point: false,
      points_used: 0,
    }
    isTransactionOpen.value = false
    if (transactionId) {
      navigateTo(`/cashier/transaction/${transactionId}/receipt/`)
    } else {
      alert("Transaksi berhasil, tapi ID tidak ditemukan untuk cetak struk.")
    }
  } catch (error) {
    console.error("Gagal checkout:", error)
    alert("Gagal melakukan transaksi. Periksa kembali jaringan atau data Anda.")
  }
}

useHead({
    title: 'Tambah Transaksi | Cashier App',
})
</script>

<template>
  <div class="pb-32 min-h-screen relative">
    
    <div class="flex items-center justify-between">
      <p class="font-bold text-3xl">Riwayat Transaksi</p>
      <div class="w-full md:w-1/2">
        <UiInput 
          v-model="searchParams" 
          placeholder="Cari Produk..." 
          variant="search" 
          icon="i-lucide-search" 
        />
      </div>
    </div>

    <div class="flex items-center justify-center gap-4 flex-wrap my-10">
      <UiProductCard 
        v-for="product in filteredProducts" 
        :key="product.id" 
        :product="product"
        :is-selected="cart.some(item => item.product.id === product.id)" 
        :is-disabled="product.stock <= 0" @toggle-selected="addToCart(product)"
      />
      <div v-if="filteredProducts.length === 0" class="text-gray-500 w-full text-center py-10">
        Produk tidak ditemukan.
      </div>
    </div>

    <transition name="fade">
      <div 
        v-if="isTransactionOpen" 
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        @click="isTransactionOpen = false"
      ></div>
    </transition>

    <div 
      class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl bg-white z-50 rounded-t-4xl transition-all duration-500 ease-in-out flex flex-col"
      :class="isTransactionOpen ? 'h-[90vh]' : 'h-25'"
    >
      
      <div class="w-full flex justify-center pt-4 cursor-pointer shrink-0" @click="isTransactionOpen = !isTransactionOpen">
        <div class="w-16 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      <div 
        class="flex items-center justify-between px-10 pb-6 pt-2 cursor-pointer group shrink-0"
        @click="isTransactionOpen = !isTransactionOpen"
      >
        <p class="text-2xl md:text-3xl font-bold group-hover:text-cyan-500 transition-colors">
          Detail Barang ({{ totalQuantity }})
        </p>
        <div class="flex items-center gap-6">
          <p class="text-xl font-bold text-gold">{{ formatRp(cartSubtotal) }}</p>
          <UiButton 
            variant="square" 
            :icon-name="isTransactionOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" 
            color="ghost" 
          />
        </div>
      </div>

      <div 
        class="px-10 pb-10 overflow-y-auto w-full flex-1 pt-8"
        v-show="isTransactionOpen"
      >
        <div class="grid grid-cols-2 gap-10">
          
          <div class="col-span-1 space-y-4 pr-2">
            <div v-if="cart.length === 0" class="text-center text-gray py-10 border-2 border-dashed border-gray-200 rounded-xl">
              Keranjang kosong. Pilih produk terlebih dahulu.
            </div>
            
            <div 
              v-for="item in cart" 
              :key="item.product.id"
              class="flex items-center bg-neutral rounded-3xl p-3 gap-4"
            >
              <img :src="item.product.image || defaultImage" :alt="item.product.name" class="w-16 h-16 rounded-lg object-cover">
              <div class="w-full">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <UiLabel :text="item.product.category" />
                    <p class="text-tertiary font-bold line-clamp-1">{{ item.product.name }}</p>
                  </div>
                  <UiButton @click="removeFromCart(item)" variant="square" color="ghost" icon-name="i-lucide-trash" />
                </div>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center gap-2">
                    <p class="text-gray font-bold">{{ formatRp(item.product.price) }}</p>
                    <p class="text-gray font-bold">|</p>
                    <p class="text-gold font-bold">{{ formatRp(item.product.price * item.quantity) }}</p>
                  </div>
                  <div class="flex items-center gap-2 bg-white rounded-lg px-1 shadow-sm">
                    <UiButton @click="decrementQty(item)" variant="square" icon-name="i-lucide-minus" color="ghost" />
                    <p class="font-bold w-6 text-center select-none">{{ item.quantity }}</p>
                    <UiButton @click="incrementQty(item)" variant="square" icon-name="i-lucide-plus" color="ghost" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-1 space-y-6">
            <div class="flex items-center justify-start gap-4 text-gold mb-6">
              <UIcon name="i-lucide-user" size="24" />
              <p class="font-bold text-3xl">Informasi Pembayaran</p>
            </div>
            
            <div class="space-y-4 p-6 rounded-3xl">
              <UiToggle v-model="form.is_member" label="Masukan/Daftar Member?" />
              
              <div v-if="form.is_member" class="space-y-2">
                <UiInput 
                  v-model="form.telephone"
                  label="No Telepon Member" 
                  placeholder="cth: 088xxxx" 
                />
                
                <p v-if="currentMember" class="text-sm font-bold text-green-500 flex items-center gap-1">
                  <UIcon name="i-lucide-check-circle" size="16" /> Member Terdaftar Ditemukan.
                </p>
                <p v-else-if="form.telephone.length > 4" class="text-sm font-medium text-orange-400 flex items-center gap-1">
                  <UIcon name="i-lucide-info" size="16" /> Nomor baru. Akan didaftarkan sebagai member.
                </p>
                <UiInput 
                  v-model="form.customer_name"
                  label="Nama Pelanggan" 
                  placeholder="Masukkan nama" 
                />
              </div>
              <UiInput 
                v-model="form.payment_amount"
                label="Total Bayar (Uang Diterima)*" 
                prefix="Rp."
                data-type="integer"
                placeholder="0" 
                :error="errors.payment_amount" 
              />
              
              <p v-if="changeAmount > 0" class="text-sm font-bold text-green-500 mt-1">
                Kembalian: {{ formatRp(changeAmount) }}
              </p>

              <div v-if="form.is_member && currentMember" class="pt-4 mt-4 border-t border-gray-200">
                
                <UiToggle 
                  v-model="form.use_point" 
                  label="Gunakan Poin Member?" 
                  :disabled="cartSubtotal <= 20000"
                />
                
                <p v-if="cartSubtotal <= 20000" class="text-xs font-medium text-red-500 mt-1">
                  *Belanja minimal Rp 20.000 untuk menggunakan poin.
                </p>
                
                <div v-if="form.use_point && cartSubtotal > 20000" class="mt-4">
                  <p class="font-bold text-gold text-end mb-2 text-sm">Poin tersedia: {{ availablePoints }}</p>
                  <UiInput 
                    v-model="form.points_used"
                    label="Masukan Jumlah Poin" 
                    type="number"
                    placeholder="cth: 2000" 
                    data-type="integer"
                    :max="availablePoints"
                    :error="errors.points_used" 
                  />
                </div>
              </div>
              <div class="pt-6 space-y-3 mt-6 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-gray">Subtotal</p>
                  <p class="font-bold text-tertiary">{{ formatRp(cartSubtotal) }}</p>
                </div>
                <div class="flex items-center justify-between" v-if="form.use_point && form.points_used">
                  <p class="font-bold text-gray">Poin Digunakan</p>
                  <p class="font-bold text-red-500">- {{ formatRp(form.points_used) }}</p>
                </div>
                <div class="flex items-center justify-between pt-2">
                  <p class="font-bold text-gray text-lg">Total Tagihan</p>
                  <p class="font-bold text-2xl text-gold">{{ formatRp(finalTotal) }}</p>
                </div>
              </div>

              <div v-if="errors.general" class="p-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm text-center">
                {{ errors.general }}
              </div>

              <UiButton 
                @click="handleCheckout"
                variant="big" 
                label="Bayar Sekarang" 
                color="yellow" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>