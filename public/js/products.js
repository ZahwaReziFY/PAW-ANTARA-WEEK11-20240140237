const productStore = createStore({
  products: window.__INITIAL_PRODUCTS__ || [],
  filter: 'all', // 'all' | 'available' | 'out'
  search: '', // kata kunci pencarian, state baru
  sortBy: 'default', // 'default' | 'price-asc' | 'price-desc' | 'name-asc', state baru
});

// komponen badge & card versi JS, paralel sama versi EJS di views/partials
function renderBadge({ label, color }) {
  const colorMap = {
    green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
    red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    orange: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700',
    gray: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  };
  const classes = colorMap[color] || colorMap.gray;
  return `<span class="inline-block px-2 py-1 text-xs font-semibold rounded-full border ${classes}">${label}</span>`;
}

// Badge stok 3 level, murni fungsi dari data (stock), dipanggil ulang tiap render
function getStockBadgeData(stock) {
  if (stock === 0) return { label: 'Habis', color: 'red' };
  if (stock <= 5) return { label: 'Stok Terbatas', color: 'orange' };
  return { label: 'Tersedia', color: 'green' };
}

// wishlistIds: Set berisi id produk yang lagi difavoritkan, dipakai buat nentuin
// ikon hati kartu ini terisi atau kosong -> ini yang bikin kartu "berbasis data & dinamis"
function renderProductCard(product, wishlistIds) {
  const isAvailable = product.stock > 0;
  const badge = renderBadge(getStockBadgeData(product.stock));
  const isWishlisted = wishlistIds.has(String(product.id));

  return `
    <div class="product-card relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" data-stock="${product.stock}">
      <button
        class="wishlist-toggle-btn absolute top-3 right-3 text-lg leading-none"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        title="${isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}"
      >${isWishlisted ? '❤️' : '🤍'}</button>
      <div class="flex items-start justify-between mb-2 pr-8">
        <h3 class="font-semibold text-gray-800 dark:text-gray-100">${product.name}</h3>
        ${badge}
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${product.description || 'Tanpa deskripsi'}</p>
      <div class="flex items-center justify-between mb-3">
        <span class="text-blue-600 dark:text-blue-400 font-bold">Rp${Number(product.price).toLocaleString('id-ID')}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">Stok: ${product.stock}</span>
      </div>
      <button
        class="add-to-cart-btn w-full ${isAvailable ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'} text-sm font-semibold py-2 rounded-lg transition-colors"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        ${isAvailable ? '' : 'disabled'}
      >
        ${isAvailable ? '+ Tambah ke Keranjang' : 'Stok Habis'}
      </button>
    </div>
  `;
}

// --- pencarian + filter status stok + sortir, semuanya derived value dari state ---
function getFilteredProducts(state) {
  let result = state.products;

  if (state.search && state.search.trim() !== '') {
    const q = state.search.trim().toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    );
  }

  if (state.filter === 'available') result = result.filter((p) => p.stock > 0);
  if (state.filter === 'out') result = result.filter((p) => p.stock === 0);

  const sorted = [...result];
  if (state.sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (state.sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (state.sortBy === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));

  return sorted;
}

function renderProductList(state) {
  const container = document.getElementById('product-list');
  const emptyState = document.getElementById('empty-state');
  const filtered = getFilteredProducts(state);

  // ambil daftar id wishlist saat ini biar kartu tau hati mana yang harus terisi
  const wishlistIds = new Set(
    (typeof wishlistStore !== 'undefined' ? wishlistStore.getState().items : []).map((item) => String(item.id))
  );

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = filtered.map((product) => renderProductCard(product, wishlistIds)).join('');
}

productStore.subscribe(renderProductList);

// kalau wishlist berubah (item ditoggle dari mana pun), kartu produk ikut di-render ulang
// biar ikon hati-nya selalu sinkron -> ini contoh dua store saling terhubung lewat subscribe
if (typeof wishlistStore !== 'undefined') {
  wishlistStore.subscribe(() => renderProductList(productStore.getState()));
}

// render ulang versi client sekali di awal, biar badge stok 3-level & hati wishlist
// langsung sinkron sama state (pola sama kayak renderCart di cart.js)
renderProductList(productStore.getState());

// tombol filter status stok
document.getElementById('filter-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  productStore.setState({ filter: btn.dataset.filter });

  document.querySelectorAll('.filter-btn').forEach((b) => {
    b.classList.remove('bg-blue-600', 'text-white');
    b.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  });
  btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  btn.classList.add('bg-blue-600', 'text-white');
});

// kotak pencarian: tiap ketikan langsung update state, kartu ke-render ulang otomatis
document.getElementById('product-search').addEventListener('input', (e) => {
  productStore.setState({ search: e.target.value });
});

// dropdown sortir harga/nama
document.getElementById('product-sort').addEventListener('change', (e) => {
  productStore.setState({ sortBy: e.target.value });
});

/**
 * event delegation buat tombol "Tambah ke Keranjang" DAN tombol wishlist -
 * dipasang di container, bukan per-tombol, soalnya tombolnya di-render ulang
 * tiap kali filter/pencarian/sortir/wishlist berubah.
 */
document.getElementById('product-list').addEventListener('click', (e) => {
  const addBtn = e.target.closest('.add-to-cart-btn');
  const wishlistBtn = e.target.closest('.wishlist-toggle-btn');

  if (addBtn && !addBtn.disabled) {
    addToCart({
      id: addBtn.dataset.id,
      name: addBtn.dataset.name,
      price: Number(addBtn.dataset.price),
    });
    cartStore.setState({ isOpen: true });
    return;
  }

  if (wishlistBtn) {
    toggleWishlist({
      id: wishlistBtn.dataset.id,
      name: wishlistBtn.dataset.name,
      price: Number(wishlistBtn.dataset.price),
    });
  }
});
