// models/Cart.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db'); // Adjust the path as necessary

class Cart extends Model {}

Cart.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Assuming the User model is named 'Users'
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products', // Assuming the Product model is named 'Products'
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Default quantity is 1
  },
}, {
  sequelize,
  modelName: 'carts',
});

module.exports = Cart;
