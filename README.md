# Toko Cart App — State Management, Dynamic Rendering, Komponen Berbasis Data

API + tampilan (EJS + Tailwind), tanpa AI. Fokus materi: katalog produk, keranjang
belanja dengan badge dinamis, dan dark/light mode — semuanya demo konsep **state
management sederhana**, **dynamic rendering**, dan **komponen berbasis data (badge
& card)**.

## Struktur folder
```
toko-cart-app/
├── app.js
├── config/database.js         # koneksi sequelize (postgres)
├── models/
│   ├── admin.model.js
│   ├── product.model.js
│   └── index.js
├── controllers/
│   ├── admin.controller.js    # login/logout admin
│   ├── product.controller.js  # CRUD produk
│   └── page.controller.js     # render halaman utama
├── middlewares/auth.middleware.js
├── routes/
│   ├── admin.routes.js
│   ├── product.routes.js
│   └── page.routes.js
├── seeders/seed.js            # admin + produk dummy
├── utils/response.js
├── views/
│   ├── index.ejs               # halaman utama
│   └── partials/
│       ├── badge.ejs           # komponen badge, berbasis data {label, color}
│       └── product-card.ejs    # komponen kartu produk
└── public/js/
    ├── store.js                 # state management: getState/setState/subscribe
    ├── theme.js                 # state dark/light mode
    ├── cart.js                  # state keranjang + badge dinamis
    └── products.js              # render katalog + filter + hook tombol keranjang
```

## Cara install & jalanin

1. Bikin database:
```sql
CREATE DATABASE toko_cart_db;
```

2. Copy `.env.example` jadi `.env`, sesuaikan kredensial DB.

3. Install & seed:
```bash
npm install
npm run seed
```

4. Jalankan:
```bash
npm run dev
```

5. Buka `http://localhost:3000` di **browser** (bukan Postman) buat liat tampilannya.

## Endpoint API

| Method | Endpoint             | Auth  | Keterangan       |
|--------|------------------------|-------|--------------------|
| POST   | /api/admin/login       | -     | Login admin (session) |
| POST   | /api/admin/logout      | admin | Logout             |
| GET    | /api/products          | -     | List produk (JSON) |
| POST   | /api/products          | admin | Tambah produk       |
| PUT    | /api/products/:id      | admin | Update produk       |
| DELETE | /api/products/:id      | admin | Hapus produk        |
| GET    | /                       | -     | Halaman utama (EJS) |

Login admin default (dari seeder): `admin` / `admin123`.

## Konsep yang kedemo

### 1. State management sederhana (`public/js/store.js`)
Pola dasar: satu object `state` jadi sumber kebenaran satu-satunya, `setState()` buat
ubah, `subscribe()` buat daftar fungsi yang mau tau kalo state berubah. Dipake ulang
buat 2 kebutuhan berbeda: `themeStore` (tema) dan `cartStore` (keranjang) — nunjukin
pola yang sama bisa dipake buat state apapun.

### 2. Komponen berbasis data (badge & card)
`badge.ejs` cuma nerima `{ label, color }`, gak ada logic spesifik per kasus. Dipake
buat 2 hal beda: status stok produk (`Tersedia`/`Habis`) dan nantinya bisa dipake buat
hal lain juga — karena dia generic. `product-card.ejs` manggil `badge.ejs` di
dalamnya (komposisi). Pola yang sama ditulis versi JS di `products.js` biar
konsisten waktu render ulang di client.

### 3. Dynamic rendering
- **Katalog produk**: render pertama dari server (SSR EJS). Begitu klik filter
  (Semua/Tersedia/Habis), render selanjutnya murni di client (`renderProductList()`
  di `products.js`) — gak reload halaman.
- **Badge keranjang**: setiap kali `addToCart()` atau `changeQty()` dipanggil,
  `cartStore` berubah, otomatis men-trigger `renderCart()` yang update angka badge,
  isi drawer, dan total harga — semuanya SEKALI JALAN dari satu sumber state, bukan
  di-update manual satu-satu di banyak tempat.
- **Dark/light mode**: klik toggle → `themeStore` berubah → `renderTheme()`
  nambah/hapus class `dark` di `<html>` + ganti icon + simpen ke `localStorage`.

## Kenapa keranjang & tema disimpen di `localStorage`?

Keduanya **state di client**, gak perlu nyimpen ke database (beda sama data produk
yang emang perlu persist di server buat semua orang). `localStorage` dipake biar gak
ilang pas halaman di-reload — konsep tambahan yang bisa dijelasin: bedanya state yang
"per-user, sementara di browser" vs "data yang perlu ada di server buat semua orang".

## Ide pengembangan lanjut
- Checkout beneran (submit isi keranjang ke endpoint baru, buat record order di DB)
- Halaman admin (EJS) buat kelola produk tanpa harus lewat Postman

## Fitur tambahan (pengembangan tugas)

Bagian ini nambahin fitur di atas struktur project yang sudah ada, tanpa mengubah
arsitektur dasarnya (tetap SSR EJS + state management sederhana tanpa framework).

### 1. Pencarian & sortir produk (extend `productStore`)
State `productStore` (di `public/js/products.js`) ditambah 2 field baru: `search`
dan `sortBy`. Input `#product-search` dan dropdown `#product-sort` di navbar
langsung `setState()` ke store ini, dan `getFilteredProducts()` diperluas supaya
memproses pencarian (cocokin nama/deskripsi) dan sortir (harga naik/turun, nama A-Z)
sebelum kartu di-render ulang — semuanya tanpa reload halaman.

### 2. Badge stok 3 level (data-driven, bukan cuma tersedia/habis)
`renderBadge()`/`badge.ejs` sekarang punya varian warna `orange` buat kondisi
"Stok Terbatas" (stok 1-5). Fungsi `getStockBadgeData(stock)` murni fungsi dari
data produk — nunjukin komponen badge yang benar-benar reaktif terhadap data,
bukan cuma dua kondisi hardcode.

### 3. Wishlist / produk favorit (state + badge + kartu baru)
File baru `public/js/wishlist.js` bikin `wishlistStore` terpisah (pakai
`createStore()` yang sama), dengan:
- Tombol hati (🤍/❤️) di tiap kartu produk buat toggle wishlist.
- Badge jumlah item wishlist di navbar yang otomatis update lewat `subscribe()`,
  persis pola yang sama kayak badge keranjang.
- Drawer wishlist dengan komponen kartu baru (`renderWishlistCard`) yang bisa
  langsung "+ Keranjang" atau dihapus dari wishlist.
- Disimpen di `localStorage` (key `wishlist`), sama pola-nya kayak cart.
- `productStore` dan `wishlistStore` saling terhubung: begitu wishlist berubah,
  `renderProductList()` dipanggil ulang supaya ikon hati di kartu produk selalu
  sinkron sama state wishlist yang sebenarnya.
