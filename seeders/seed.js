require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Admin, Product } = require('../models');

const SALT_ROUNDS = 10;

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil');
    await sequelize.sync();

    const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const [admin] = await Admin.findOrCreate({
      where: { username: 'admin' },
      defaults: { password: hashedPassword },
    });
    console.log('Admin siap:', admin.username);

    const existingProducts = await Product.count();
    if (existingProducts === 0) {
      await Product.bulkCreate([
        { name: 'Kaos Polos Cotton Combed', description: 'Bahan adem, cocok sehari-hari', price: 75000, stock: 50 },
        { name: 'Kemeja Flanel', description: 'Motif kotak-kotak, bahan tebal', price: 150000, stock: 20 },
        { name: 'Celana Chino Slim Fit', description: 'Warna khaki, bahan stretch', price: 180000, stock: 15 },
        { name: 'Sepatu Sneakers Canvas', description: 'Cocok buat kasual', price: 220000, stock: 30 },
        { name: 'Topi Baseball', description: 'Adjustable, banyak warna', price: 45000, stock: 0 },
        { name: 'Jaket Bomber', description: 'Bahan tebal, hangat', price: 250000, stock: 8 },
      ]);
      console.log('Produk dummy berhasil ditambahin');
    } else {
      console.log('Produk udah ada, skip supaya gak dobel');
    }

    console.log('\nSeeding selesai ✅');
    console.log('Login admin: username=admin password=admin123');
    process.exit(0);
  } catch (err) {
    console.error('Gagal seeding:', err.message);
    process.exit(1);
  }
}

seed();
