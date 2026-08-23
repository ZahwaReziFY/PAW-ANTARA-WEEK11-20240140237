/**
 * Fitur tambahan: Wishlist / produk favorit.
 * State management-nya sengaja dipisah dari cart (store sendiri), tapi tetap
 * pakai createStore() yang sama dari store.js - nunjukin store itu reusable
 * buat bikin banyak "slice" state yang independen di satu halaman yang sama.
 */
function loadWishlistFromStorage() {
  try {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const wishlistStore = createStore({
  items: loadWishlistFromStorage(), // [{ id, name, price }]
  isOpen: false,
});

// --- komponen kartu mini wishlist (berbasis data, beda bentuk dari cart item) ---
function renderWishlistCard(item) {
  return `
    <div class="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-800 dark:text-gray-100">${item.name}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500">Rp${Number(item.price).toLocaleString('id-ID')}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="wishlist-add-to-cart text-xs font-semibold px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          data-id="${item.id}" data-name="${item.name}" data-price="${item.price}"
        >+ Keranjang</button>
        <button class="wishlist-remove w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300" data-id="${item.id}">✕</button>
      </div>
    </div>
  `;
}

/**
 * Badge jumlah wishlist di navbar: pola persis kayak cart-badge di cart.js.
 * Tiap wishlistStore.setState() dipanggil, listener ini otomatis jalan lagi
 * lewat subscribe() dan badge/drawer selalu sinkron sama state.
 */
function renderWishlist(state) {
  const badge = document.getElementById('wishlist-badge');
  const itemsContainer = document.getElementById('wishlist-items');
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('wishlist-overlay');

  if (state.items.length > 0) {
    badge.textContent = state.items.length > 99 ? '99+' : state.items.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  itemsContainer.innerHTML =
    state.items.length === 0
      ? '<p class="text-center text-gray-400 dark:text-gray-500 py-8">Belum ada produk favorit</p>'
      : state.items.map(renderWishlistCard).join('');

  if (state.isOpen) {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
  } else {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('hidden');
  }

  localStorage.setItem('wishlist', JSON.stringify(state.items));
}

wishlistStore.subscribe(renderWishlist);
renderWishlist(wishlistStore.getState()); // sync pas pertama load, sama kayak cart.js

// --- actions: tambah/hapus produk dari wishlist (toggle berdasarkan id) ---
function toggleWishlist({ id, name, price }) {
  const items = wishlistStore.getState().items;
  const exists = items.some((item) => String(item.id) === String(id));

  wishlistStore.setState({
    items: exists
      ? items.filter((item) => String(item.id) !== String(id))
      : [...items, { id, name, price }],
  });
}

// --- event listeners navbar & drawer ---
document.getElementById('wishlist-toggle-nav').addEventListener('click', () => {
  wishlistStore.setState({ isOpen: true });
});
document.getElementById('wishlist-close').addEventListener('click', () => {
  wishlistStore.setState({ isOpen: false });
});
document.getElementById('wishlist-overlay').addEventListener('click', () => {
  wishlistStore.setState({ isOpen: false });
});

// event delegation buat tombol di dalam kartu wishlist, karena kartunya di-render ulang
document.getElementById('wishlist-items').addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.wishlist-remove');
  const addToCartBtn = e.target.closest('.wishlist-add-to-cart');

  if (removeBtn) {
    toggleWishlist({ id: removeBtn.dataset.id });
  }

  if (addToCartBtn) {
    addToCart({
      id: addToCartBtn.dataset.id,
      name: addToCartBtn.dataset.name,
      price: Number(addToCartBtn.dataset.price),
    });
    cartStore.setState({ isOpen: true });
    wishlistStore.setState({ isOpen: false });
  }
});
