// models/Product.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db'); // Adjust path as necessary

class Product extends Model {}

Product.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  image: {
    type: DataTypes.STRING, // URL or path to the product image
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'products',
});

module.exports = Product;
