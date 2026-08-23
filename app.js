require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { sequelize } = require('./models');

const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/product.routes');
const pageRoutes = require('./routes/page.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-default',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
);

app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/', pageRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil');

    await sequelize.sync();
    console.log('Sync model selesai');

    app.listen(PORT, () => {
      console.log(`Server jalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Gagal konek ke database:', err.message);
  }
}

start();
