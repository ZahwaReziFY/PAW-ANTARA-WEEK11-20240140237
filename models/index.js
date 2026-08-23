const sequelize = require('../config/database');
const Admin = require('./admin.model');
const Product = require('./product.model');

module.exports = { sequelize, Admin, Product };
